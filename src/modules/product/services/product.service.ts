import { BadRequestException } from '@nestjs/common/exceptions';
import { PrismaService } from './../../prisma/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { ProductInput } from '../dto/inputs/product.input';
import { ProductEntity } from '@prisma/client';
import { UpdateProductInput } from '../dto/inputs/update-product.input';
import { CreateCategoryInput } from '../dto/inputs/category/category.input';
import { OrderStatusEnum } from '@enums/order-status.enum';

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
    const category = await this.prismaService.categoryEntity
      .findFirst({
        where: { name: productInput.category },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException('Cannot get category. Please try again.');
      });

    if (!category) {
      throw new BadRequestException('Cannot get category. Please try again.');
    }

    return this.prismaService.productEntity
      .create({
        data: {
          ...productInput,
          productType: category.productType,
        },
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
    const pendingOrShippedOrders = await this.prismaService.transactionEntity.findMany({
      where: {
       OR:[
        {status: OrderStatusEnum.PENDING},
        {status: OrderStatusEnum.SHIPPED}
       ]
      }
    })

    let somePending = false
    pendingOrShippedOrders.forEach((order) => {
      if (order.products.find((product: any) => product.productId === productId )) {
        somePending = true
      }
    })

    if (somePending) {
      throw new BadRequestException(
        'Cannot delete product have pending orders. Please try again.',
      );
    }

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

  async createCategory(categoryInput: CreateCategoryInput) {
    return this.prismaService.categoryEntity
      .create({
        data: categoryInput,
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException(
          'Cannot create categories. Please try again.',
        );
      });
  }

  async getCategories(productType: string) {
    return this.prismaService.categoryEntity
      .findMany(
        productType === 'all'
          ? undefined
          : {
              where: { productType },
            },
      )
      .catch((error) => {
        console.log(error);
        throw new BadRequestException(
          'Cannot get categories. Please try again.',
        );
      });
  }

  async deleteCategory(id: string) {
    return this.prismaService.categoryEntity
      .delete({
        where: { id },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException(
          'Cannot delete category. Please try again.',
        );
      });
  }
}
