import { IsNumber, IsOptional, Min } from 'class-validator';

export class IFilterInput {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(10)
  pageItem?: number;

  @IsOptional()
  search?: string;
}

export const filterDefaultValue: IFilterInput = {
  page: 1,
  pageItem: 10,
  search: '',
};

