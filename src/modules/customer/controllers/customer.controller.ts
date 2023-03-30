import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from './../dtos/inputs/create-customer.input';
import { CustomerMapper } from './../dtos/mappers/customer.mapper';
import { CurrentUser } from './../../../common/decorators/current-user.decorator';
import { RestAuthGuard } from './../../../common/auth/guards/rest-auth.guard';
import { CustomerService } from './../services/customer.service';
import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { GenericResponse } from '@common/decorators/generic-response.decorator';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('/login')
  @GenericResponse()
  async loginCustomer(@Body('email') email: string) {
    const result = await this.customerService.loginCustomer(email);

    return {
      data: {
        ...result,
        customer: CustomerMapper.displayOne(result.customer),
      },
    };
  }

  @Get()
  @UseGuards(RestAuthGuard)
  @GenericResponse()
  async getCustomer(@CurrentUser('id') customerId: string) {
    const result = await this.customerService.getCustomer(customerId);

    return {
      data: CustomerMapper.displayOne(result),
    };
  }

  @Post()
  @GenericResponse()
  async createCustomer(@Body() createCustomerInput: CreateCustomerInput) {
    const result = await this.customerService.createCustomer(
      createCustomerInput,
    );

    return {
      data: CustomerMapper.displayOne(result),
    };
  }

  @Put()
  @GenericResponse()
  @UseGuards(RestAuthGuard)
  async updateCustomer(
    @CurrentUser('id') customerId: string,
    @Body() updateCustomerInput: UpdateCustomerInput,
  ) {
    const result = await this.customerService.updateCustomer(
      customerId,
      updateCustomerInput,
    );

    return {
      data: CustomerMapper.displayOne(result),
    };
  }
}
