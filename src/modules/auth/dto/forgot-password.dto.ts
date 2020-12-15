import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  constructor(partial: Partial<ForgotPasswordDto>) {
    Object.assign(this, partial);
  }
}
