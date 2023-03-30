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

@Injectable()
export class CustomerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async loginCustomer(email: string) {
    const customer = await this.prismaService.customerEntity
      .findFirst({
        where: {
          email: email,
        },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException('Cannot login, Please try again.');
      });

    if (!email || !customer) {
      throw new NotFoundException('Invalid creadentials');
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
          password: 'autosmart2023',
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
    delete updateCustomerInput['email'];
    delete updateCustomerInput['id'];
    return this.prismaService.customerEntity
      .update({
        where: {
          id: customerId,
        },
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
}
