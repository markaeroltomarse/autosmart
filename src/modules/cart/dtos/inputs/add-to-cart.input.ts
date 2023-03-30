import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AddToCartInput {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
