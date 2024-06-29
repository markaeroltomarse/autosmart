import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddToCartInput {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  @IsNotEmpty()
  color?: string;

  @IsOptional()
  @IsNotEmpty()
  application?: string;
}
