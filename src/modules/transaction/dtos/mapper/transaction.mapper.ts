import { OrderStatusEnum } from './../../../../data/enums/order-status.enum';
import { TransactionEntity } from '@prisma/client';

export class TransactionMapper {
  static seperateByStatus(transactions: TransactionEntity[]) {
    return {
      [OrderStatusEnum.PENDING]: transactions.filter(
        (transaction) => transaction.status === OrderStatusEnum.PENDING,
      ),
      [OrderStatusEnum.SHIPPED]: transactions.filter(
        (transaction) => transaction.status === OrderStatusEnum.SHIPPED,
      ),
      [OrderStatusEnum.COMPLETED]: transactions.filter(
        (transaction) => transaction.status === OrderStatusEnum.COMPLETED,
      ),
      [OrderStatusEnum.CANCELLED]: transactions.filter(
        (transaction) => transaction.status === OrderStatusEnum.CANCELLED,
      ),
    };
  }
}
