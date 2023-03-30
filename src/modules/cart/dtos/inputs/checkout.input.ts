import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsInt,
  IsPositive,
} from 'class-validator';
import { ICartProduct } from './../interfaces/cart-product.interface';
export class CheckOutInput {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CartProduct)
  products: ICartProduct[];
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
