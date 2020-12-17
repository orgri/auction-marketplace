import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  MaxLength,
  MinLength,
} from 'class-validator';
import { User } from '../../../db/models';

export class UserUpdateDto {
  @MaxLength(User.EMAIL_LENGTH)
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsNotEmpty()
  @MinLength(User.MIN_PASSWORD_LENGTH)
  password: string;

  @IsOptional()
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsPhoneNumber(null)
  phone: string;

  @IsOptional()
  @IsNotEmpty()
  birth: string;

  constructor(partial: Partial<UserUpdateDto>) {
    Object.assign(this, partial);
  }
}
