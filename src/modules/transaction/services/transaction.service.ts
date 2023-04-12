import { ProductService } from './../../product/services/product.service';
import { OrderStatusEnum } from './../../../data/enums/order-status.enum';
import { BadRequestException } from '@nestjs/common/exceptions';
import { PrismaService } from './../../prisma/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateTransactionInput } from '../dtos/inputs/update-transaction.input';
import { ICartProduct } from '@modules/cart/dtos/interfaces/cart-product.interface';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productService: ProductService,
  ) {}

  async getCustomerTransactions(customerId: string, filter?: any) {
    const transactions = await this.prismaService.transactionEntity
      .findMany({
        where: {
          customerId: customerId,
          createdAt: filter?.date || undefined,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException(
          'Cannot get transaction, Please try again.',
        );
      });

    let index = 0;
    for (let transaction of transactions) {
      const products = await this.getProducts(transaction.products as any);
      transactions[index].products = products;

      index++;
    }

    return transactions;
  }

  async getTransactions(filter?: any) {
    let transactions = await this.prismaService.transactionEntity
      .findMany({
        where: {
          createdAt: filter?.date || undefined,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException(
          'Connot get transaction, Please try again.',
        );
      });

    let index = 0;
    for (let transaction of transactions) {
      const products = await this.getProducts(transaction.products as any);
      transactions[index].products = products;

      index++;
    }

    return transactions;
  }

  async updateTransaction(
    serialNumber: string,
    updateTransactionInput: UpdateTransactionInput,
  ) {
    const transaction = await this.prismaService.transactionEntity.findFirst({
      where: {
        serialNumber: serialNumber,
      },
    });

    if (
      !transaction ||
      transaction.status === OrderStatusEnum.COMPLETED ||
      transaction.status === OrderStatusEnum.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot update order status, please try again.',
      );
    }

    return this.prismaService.transactionEntity.update({
      where: {
        id: transaction.id,
      },
      data: updateTransactionInput,
    });
  }

  async getProducts(transactionProducts: ICartProduct[]) {
    const products = [];
    for (let cartItem of transactionProducts) {
      const item = cartItem as unknown as ICartProduct;
      products.push({
        quantity: item.quantity,
        product: await this.productService.getProduct(item.productId),
      });
    }

    return products;
  }
}
