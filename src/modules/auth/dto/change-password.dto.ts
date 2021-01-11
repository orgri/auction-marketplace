import { IsNotEmpty, MinLength } from 'class-validator';
import { User } from '../../../db/models';

export class ChangePasswordDto {
  @IsNotEmpty()
  @MinLength(User.MIN_PASSWORD_LENGTH)
  password: string;

  @IsNotEmpty()
  repeatPassword: string;

  constructor(partial: Partial<ChangePasswordDto>) {
    Object.assign(this, partial);
  }
}
