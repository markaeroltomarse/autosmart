import { ProductService } from './../product/services/product.service';
import { PrismaService } from './../prisma/services/prisma.service';
import { TransactionService } from './services/transaction.service';
import { Module } from '@nestjs/common';
import { TransactionController } from './controllers/transaction.controller';
import { CustomerService } from '@modules/customer/services/customer.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [TransactionController],
  providers: [
    TransactionService,
    PrismaService,
    ProductService,
    CustomerService,
    JwtService,
  ],
})
export class TransactionModule {}
