import { GenericResponse } from '@common/decorators/generic-response.decorator';
import { FE_URL } from '@common/environment';
import { EmployeeEnum } from '@enums/role.enum';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { RestAuthGuard } from './../../../common/auth/guards/rest-auth.guard';
import { CurrentUser } from './../../../common/decorators/current-user.decorator';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from './../dtos/inputs/create-customer.input';
import { CustomerMapper } from './../dtos/mappers/customer.mapper';
import { CustomerService } from './../services/customer.service';

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
  async getCustomer(@CurrentUser() user: any) {
    if (user.role === EmployeeEnum.ADMIN) {
      return {
        data: CustomerMapper.displayOne(user),
      };
    }

    const result = await this.customerService.getCustomer(user?.id);
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

  @Patch('verify')
  @GenericResponse()
  @UseGuards(RestAuthGuard)
  async resendVerifyAccountEmail(@CurrentUser('id') customerId: string) {
    return this.customerService.resendVerifyAccountEmail(customerId);
  }
}
