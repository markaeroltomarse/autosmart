import { OrderStatusEnum } from '@enums/order-status.enum';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTransactionInput {
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(OrderStatusEnum)
  status?: OrderStatusEnum;

  @IsOptional()
  @IsEmail()
  email?: string;
}
