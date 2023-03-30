import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AdminLoginInput {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
