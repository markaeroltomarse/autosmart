import { OrderStatusEnum } from '@enums/order-status.enum';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTransactionInput {
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(OrderStatusEnum)
  status?: OrderStatusEnum;
}
