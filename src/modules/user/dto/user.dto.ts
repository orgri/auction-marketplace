import { Exclude, Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  birth: string;

  @Exclude()
  password: string;
}
