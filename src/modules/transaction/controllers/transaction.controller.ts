import { UpdateTransactionInput } from './../dtos/inputs/update-transaction.input';
import { TransactionMapper } from './../dtos/mapper/transaction.mapper';
import { RestAuthGuard } from './../../../common/auth/guards/rest-auth.guard';
import { GenericResponse } from '@common/decorators/generic-response.decorator';
import { TransactionService } from './../services/transaction.service';
import { Controller, Get, Put } from '@nestjs/common';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import {
  Body,
  Param,
  Query,
} from '@nestjs/common/decorators/http/route-params.decorator';
import { OrderStatusEnum } from '@enums/order-status.enum';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/customer')
  @GenericResponse()
  @UseGuards(RestAuthGuard)
  async getCustomerTransactions(@CurrentUser('id') customerId: string) {
    const result = await this.transactionService.getCustomerTransactions(
      customerId,
    );

    return {
      data: TransactionMapper.seperateByStatus(result),
    };
  }

  @Get()
  @GenericResponse()
  @UseGuards(RestAuthGuard)
  async getTransactions(@Query() filter: any) {
    const result = await this.transactionService.getTransactions(filter);

    return {
      data: TransactionMapper.seperateByStatus(result),
    };
  }

  @Put(':serialNumber')
  @GenericResponse()
  @UseGuards(RestAuthGuard)
  async updateTransaction(
    @Param('serialNumber') serialNumber: string,
    @Body() updateTransactionInput: UpdateTransactionInput,
  ) {
    const result = await this.transactionService.updateTransaction(
      serialNumber,
      updateTransactionInput,
    );

    return {
      data: result,
    };
  }
}
