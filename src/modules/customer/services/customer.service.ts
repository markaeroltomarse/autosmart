import { BASE_URL, JWT_SECRET } from '@common/environment';
import { GeneratorProvider } from '@common/providers/generator.provider';
import { excluder } from '@common/utils/object';
import { EmployeeEnum } from '@enums/role.enum';
import { AdminLoginInput } from '@modules/admin/dto/input/login-admin.input';
import { EmailNotificationService } from '@modules/notifications/services/email-notification.service';
import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { CustomerEntity } from '@prisma/client';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from '../dtos/inputs/create-customer.input';
import { PrismaService } from './../../prisma/services/prisma.service';
// import { CacheService } from '@modules/cache/services/cache.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly notificationService: EmailNotificationService, // private readonly cacheService: CacheService,
  ) {}

  async loginAdmin(loginInput: AdminLoginInput, isThrow: boolean = true) {
    const admin = await this.prismaService.adminEntity.findFirst({
      where: {
        email: loginInput.email,
      },
    });

    if (
      !admin ||
      !GeneratorProvider.validateHash(loginInput.password, admin.password) //  Decrypt password and check if match
    ) {
      if (isThrow) {
        throw new BadRequestException('Invalid credentials. Please try again.');
      }
    }

    // Create a token that will handle in Front End. for security
    const token = admin
      ? this.jwtService.sign(
          { id: admin.id },
          {
            secret: JWT_SECRET,
          },
        )
      : '';

    return {
      admin,
      token,
    };
  }

  async loginCustomer(email: string, password?: string) {
    // If login is by Email and Password
    let where: any = { email };
    if (password) {
      where.password = password;
    }

    const customer = await this.prismaService.customerEntity
      .findFirst({
        where,
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException('Cannot login, Please try again.');
      });

    if (!email || !customer) {
      const admin = await this.loginAdmin({
        email: email,
        password,
      });

      return {
        customer: {
          ...admin.admin,
          role: EmployeeEnum.ADMIN,
        },
        token: admin.token,
      };
    }

    // Create a token that will handle in Front End. for security
    const token = this.jwtService.sign(
      { id: customer.id },
      {
        secret: JWT_SECRET,
      },
    );

    const generateOTP = Math.floor(100000 + Math.random() * 900000);
    console.log('generateOTP', generateOTP);

    if (password) {
      // Send Verification Email
      await this.notificationService.sendEmail(
        {
          emailRecipient: customer.email,
          emailTemplate: 'otp-login.template.html',
          emailSubject: `OTP Verification ${customer.email.split('@')[0]}`,
        },
        {
          email: customer.email.split('@')[0],
          otp: generateOTP,
        },
      );
    }

    return {
      customer,
      token,
      otp: generateOTP,
    };
  }

  async createCustomer(createCustomerInput: CreateCustomerInput) {
    const customer = await this.prismaService.customerEntity.findFirst({
      where: {
        email: createCustomerInput.email,
      },
    });

    if (customer) {
      throw new BadRequestException('Email already Exist, Please try again.');
    }

    const savedCustomer = await this.prismaService.customerEntity
      .create({
        data: {
          ...createCustomerInput,
          password: createCustomerInput?.password || 'autosmart2023',
          // isVerified: !createCustomerInput?.password,
        },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException('Cannot register, Please try again.');
      });

    await this.prismaService.cartEntity
      .create({
        data: {
          customerId: savedCustomer.id,
          products: [],
        },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException('Cannot add to cart, Please try again.');
      });

    if (createCustomerInput?.password) {
      // Send Verification Email
      await this.sendVerifyAccountEmail(savedCustomer);
    }

    const token = this.jwtService.sign(
      { id: savedCustomer.id },
      {
        secret: JWT_SECRET,
      },
    );

    return {
      customer: savedCustomer,
      token: !createCustomerInput?.password ? token : '',
    };
  }

  async updateCustomer(
    customerId: string,
    updateCustomerInput: UpdateCustomerInput,
  ) {
    const { address, defaultAddress } = updateCustomerInput;

    if ((address && !defaultAddress) || (!address && defaultAddress)) {
      if (address) {
        throw new BadRequestException('defaultAddress is required.');
      } else {
        throw new BadRequestException('address is required.');
      }
    }

    if (
      updateCustomerInput?.defaultAddress &&
      !updateCustomerInput?.address.includes(
        updateCustomerInput?.defaultAddress,
      )
    ) {
      throw new BadRequestException(
        'Default Address should included into address list.',
      );
    }

    const where: any = {};
    if (updateCustomerInput?.['email']) {
      const user = await this.prismaService.customerEntity.findFirst({
        where: { email: updateCustomerInput['email'] },
        select: { id: true },
      });
      where.id = user.id;
    } else {
      where.id = customerId;
    }

    delete updateCustomerInput['email'];
    delete updateCustomerInput['id'];

    return this.prismaService.customerEntity
      .update({
        where,
        data: updateCustomerInput,
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException(
          'Cannot update profile, Please try again.',
        );
      });
  }

  async getCustomer(customerId: string, isRider?: boolean) {
    const customer = await this.prismaService.customerEntity
      .findFirst({
        where: {
          id: customerId,
          isRider,
        },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException('Cannot get profile, Please try again.');
      });

    return customer;
  }

  async getRiders(): Promise<CustomerEntity[]> {
    const riders = await this.prismaService.customerEntity.findMany({
      where: {
        isRider: true,
      },
    });

    const outputRiders: any[] = [];
    for (const rider of riders) {
      const count = await this.prismaService.transactionEntity.count({
        where: {
          riderId: rider.id,
        },
      });

      outputRiders.push(
        excluder({ ...rider, deliveries: count }, ['password']),
      );
    }

    return outputRiders;
  }

  async generateToken(user) {
    const token = this.jwtService.sign(
      {
        id: user.id,
        role: user.role,
      },
      {
        secret: JWT_SECRET,
      },
    );

    return token;
  }

  async resendVerifyAccountEmail(customerId: string) {
    const customer = await this.prismaService.customerEntity.findFirst({
      where: { id: customerId },
    });

    return this.sendVerifyAccountEmail(customer);
  }

  async sendVerifyAccountEmail(customer: CustomerEntity) {
    await this.notificationService.sendEmail(
      {
        emailRecipient: customer.email,
        emailTemplate: 'verify.template.html',
        emailSubject: `Verify Email Account ${customer.email.split('@')[0]}`,
      },
      {
        verifyLink: `${BASE_URL}/api/customers/verify?email=${encodeURIComponent(
          customer.email,
        )}`,
        email: customer.email,
      },
    );

    return customer.id;
  }
}
