import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { PrismaService } from './../../prisma/services/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from '../dtos/inputs/create-customer.input';
import { BASE_URL, JWT_SECRET } from '@common/environment';
import { excluder } from '@common/utils/object';
import { CustomerEntity } from '@prisma/client';
import { EmailNotificationService } from '@modules/notifications/services/email-notification.service';
// import { CacheService } from '@modules/cache/services/cache.service';
import { filterDefaultValue } from 'src/data/dto/filter-input.dto';
import { ICustomersFilter } from '../dtos/inputs/customers-filter-input.dto';
import { setObjectDefaultValue } from 'src/utils/object.util';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly notificationService: EmailNotificationService, // private readonly cacheService: CacheService,
  ) {}

  async loginCustomer(email: string, password?: string) {
    // If login is by Email and Password
    const where: any = { email };
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
      throw new NotFoundException('Invalid credentials');
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

    return savedCustomer;
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

  async getCustomers(f: ICustomersFilter) {
    const { search, page, pageItem, role } = setObjectDefaultValue(
      f,
      filterDefaultValue,
    );

    const customers = await this.prismaService.customerEntity.findMany({
      where: {
        OR: [
          {
            fname: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            lname: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
        role: role,
      },
      skip: (page - 1) * pageItem,
      take: pageItem,
    });

    return customers;
  }

  async getCustomer(customerId: string, isRider?: boolean) {
    return this.prismaService.customerEntity
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

  // REMOVE COMMENTS
  // ADD COMMENTS
}
