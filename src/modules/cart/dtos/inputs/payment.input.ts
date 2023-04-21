import { IsNotEmpty } from 'class-validator';
export class PaymentInput {
  @IsNotEmpty()
  externalId: string;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  phoneNumber: string;
}
