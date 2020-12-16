import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  repeatPassword: string;

  constructor(partial: Partial<ChangePasswordDto>) {
    Object.assign(this, partial);
  }
}
