import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsInt,
  IsPositive,
} from 'class-validator';
import { ICheckoutCartProduct } from './../interfaces/cart-product.interface';
export class CheckOutInput {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CartProduct)
  products: ICheckoutCartProduct[];

  @IsNotEmpty()
  @IsString()
  serialNumber: string;
}

export class CartProduct {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  quantity: number;
}
