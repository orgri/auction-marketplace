import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthPayloadDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  constructor(partial: Partial<AuthPayloadDto>) {
    Object.assign(this, partial);
  }
}
