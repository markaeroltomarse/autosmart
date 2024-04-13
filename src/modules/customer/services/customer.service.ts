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
import { JWT_SECRET } from '@common/environment';
import { count } from 'console';
import { excluder } from '@common/utils/object';
import { CustomerEntity } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async loginCustomer(email: string, password?: string) {
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

    return {
      customer,
      token,
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

    let where: any = {};
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

  async getCustomer(customerId: string) {
    return this.prismaService.customerEntity
      .findFirst({
        where: {
          id: customerId,
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
    for (let rider of riders) {
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
}
