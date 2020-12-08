import { IsNotEmpty } from 'class-validator';

export class AuthPayloadDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
