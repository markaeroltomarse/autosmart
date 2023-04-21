import { ProductService } from './../product/services/product.service';
import { PrismaService } from './../prisma/services/prisma.service';
import { CartService } from './services/cart.service';
import { CartController } from './controllers/cart.controller';
import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';

@Module({
  controllers: [CartController],
  providers: [CartService, PrismaService, ProductService, PaymentService],
})
export class CartModule {}
