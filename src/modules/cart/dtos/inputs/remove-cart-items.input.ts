import { IsArray, IsNotEmpty } from 'class-validator';

export class RemoveCartItemsInput {
  @IsArray()
  @IsNotEmpty()
  productCartRecordIds: string[];
}
