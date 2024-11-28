import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { GenderEnum } from './../../../../data/enums/gender.enum';
export class CreateCustomerInput {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsNotEmpty()
  fname?: string;

  @IsOptional()
  @IsNotEmpty()
  lname?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  address?: string[];

  @IsOptional()
  @IsNotEmpty()
  defaultAddress?: string;

  @IsOptional()
  @IsNotEmpty()
  profileImage?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isRider?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsNotEmpty()
  role?: string;
}

// export class UpdateCustomerInput extends PartialType(
//   OmitType(CreateCustomerInput, ['email'] as const),
// ) {

// }

export class UpdateCustomerInput extends PartialType(
  OmitType(CreateCustomerInput, ['email'] as const),
) {
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateEmployeeInput extends PartialType(
  OmitType(CreateCustomerInput, ['email'] as const),
) {
  @IsOptional()
  @IsNotEmpty()
  fname?: string;

  @IsOptional()
  @IsNotEmpty()
  lname?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;
}
