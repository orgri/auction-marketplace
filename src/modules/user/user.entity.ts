import { Entity, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Base } from '../../common/base';

@Entity({ name: 'users' })
export class User extends Base {
  static readonly EMAIL_LENGTH = 30;
  static readonly PASSWORD_LENGTH = 100;
  static readonly MIN_PASSWORD_LENGTH = 8;
  static readonly PHONE_NUMBER_LENGTH = 30;
  static readonly FIRST_NAME_LENGTH = 30;
  static readonly LAST_NAME_LENGTH = 30;

  @Column({ unique: true, length: User.EMAIL_LENGTH })
  email: string;

  @Column({ unique: true, length: User.PHONE_NUMBER_LENGTH })
  phone: string;

  @Column({ length: User.FIRST_NAME_LENGTH })
  firstName: string;

  @Column({ length: User.LAST_NAME_LENGTH })
  lastName: string;

  @Column()
  birth: string;

  @Exclude()
  @Column({ length: User.PASSWORD_LENGTH })
  password: string;
}
