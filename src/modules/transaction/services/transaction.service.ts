import { ProductService } from './../../product/services/product.service';
import { OrderStatusEnum } from './../../../data/enums/order-status.enum';
import { BadRequestException } from '@nestjs/common/exceptions';
import { PrismaService } from './../../prisma/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateTransactionInput } from '../dtos/inputs/update-transaction.input';
import { ICartProduct } from '@modules/cart/dtos/interfaces/cart-product.interface';
import { CustomerService } from '@modules/customer/services/customer.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productService: ProductService,
    private readonly customerService: CustomerService,
  ) {}

  async getCustomerTransactions(customerId: string, filter?: any) {
    const transactions: any = await this.prismaService.transactionEntity
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

      const customer = await this.customerService.getCustomer(
        transactions[index].customerId,
      );
      transactions[index].address = customer.defaultAddress;
      transactions[index].contactNumber = customer.contactNumber;
      transactions[index].fullname = customer.lname + ', ' + customer.fname;
      index++;
    }

    return transactions;
  }

  async getTransactions(filter?: any) {
    let transactions: any = await this.prismaService.transactionEntity
      .findMany({
        where: {
          createdAt: filter?.date || undefined,
          ...(filter || {}),
        },
        include: {
          customer: true,
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

      const customer = await this.customerService.getCustomer(
        transactions[index].customerId,
      );

      if (transaction?.riderId) {
        const rider = await this.customerService.getCustomer(
          transaction.riderId,
          true,
        );

        transactions[index].rider = rider;
      }
      transactions[index].address = customer.defaultAddress;
      transactions[index].contactNumber = customer.contactNumber;
      transactions[index].fullname = customer.lname + ', ' + customer.fname;
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

    let settingDelivery: any = {};
    if (updateTransactionInput?.email) {
      const deliverBy = await this.prismaService.customerEntity.findFirst({
        where: {
          email: updateTransactionInput?.email,
        },
      });

      if (!deliverBy) {
        throw new BadRequestException('Delivery Staff not found.');
      }

      settingDelivery.riderId = deliverBy.id;
    }

    delete updateTransactionInput['email'];

    return this.prismaService.transactionEntity.update({
      where: {
        id: transaction.id,
      },
      data: {
        ...updateTransactionInput,
        ...settingDelivery,
      },
    });
  }

  async getProducts(transactionProducts: ICartProduct[]) {
    const products = [];
    for (let cartItem of transactionProducts) {
      const item = cartItem as unknown as ICartProduct;
      products.push({
        ...item,
        quantity: item.quantity,
        product: await this.productService.getProduct(item.productId),
      });
    }

    return products;
  }
}
