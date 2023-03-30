import { ProductService } from './../product/services/product.service';
import { PrismaService } from './../prisma/services/prisma.service';
import { CartService } from './services/cart.service';
import { CartController } from './controllers/cart.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [CartController],
  providers: [CartService, PrismaService, ProductService],
})
export class CartModule {}
