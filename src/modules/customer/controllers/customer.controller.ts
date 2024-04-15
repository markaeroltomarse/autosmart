import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from './../dtos/inputs/create-customer.input';
import { CustomerMapper } from './../dtos/mappers/customer.mapper';
import { CurrentUser } from './../../../common/decorators/current-user.decorator';
import { RestAuthGuard } from './../../../common/auth/guards/rest-auth.guard';
import { CustomerService } from './../services/customer.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GenericResponse } from '@common/decorators/generic-response.decorator';
import { Response } from 'express';
import { FE_URL } from '@common/environment';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('/login')
  @GenericResponse()
  async loginCustomer(
    @Body('email') email: string,
    @Body('password') password?: string,
  ) {
    const result = await this.customerService.loginCustomer(email, password);

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

  @Get('/riders')
  @GenericResponse()
  async getRiders() {
    const result = await this.customerService.getRiders();

    return {
      data: result,
    };
  }

  @Get('verify')
  async verifyAccount(@Query() { email }: any, @Res() res: Response) {
    const user = await this.customerService.updateCustomer(email, {
      email,
      isVerified: true,
    });

    const token = await this.customerService.generateToken(user);
    return res.redirect(
      `${FE_URL}/account/authentication?approved=true&token=${token}`,
    );
  }
}
