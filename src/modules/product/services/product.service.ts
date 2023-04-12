import { BadRequestException } from '@nestjs/common/exceptions';
import { PrismaService } from './../../prisma/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { ProductInput } from '../dto/inputs/product.input';
import { ProductEntity } from '@prisma/client';
import { UpdateProductInput } from '../dto/inputs/update-product.input';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  async getProducts(filter?: { category?: string }) {
    return this.prismaService.productEntity
      .findMany({
        where: { category: filter?.category },
        orderBy: {
          createdAt: 'desc',
        },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException('Cannot get products. Please try again.');
      });
  }

  async getProduct(productId: string) {
    return this.prismaService.productEntity
      .findFirst({
        where: {
          id: productId,
        },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException('Cannot get product. Please try again.');
      });
  }

  async createProduct(productInput: ProductInput) {
    return this.prismaService.productEntity
      .create({
        data: productInput,
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException(
          'Cannot create product. Please try again.',
        );
      });
  }

  async updateProduct(
    productId: string,
    updateProductInput: UpdateProductInput,
  ) {
    delete updateProductInput['id'];
    return this.prismaService.productEntity
      .update({
        where: {
          id: productId,
        },
        data: updateProductInput,
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException(
          'Cannot update product. Please try again.',
        );
      });
  }

  async deleteProduct(productId: string) {
    return this.prismaService.productEntity
      .delete({
        where: { id: productId },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException(
          'Cannot delete products. Please try again.',
        );
      });
  }
}
