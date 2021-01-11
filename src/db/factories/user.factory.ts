import * as Faker from 'faker';
import { define } from 'typeorm-seeding';
import { User } from '../models';

define(User, (faker: typeof Faker, id: number) => {
  const user = new User();

  user.email = `user${++id}@example.com`;
  user.phone = faker.phone.phoneNumber('+38095#######');
  user.firstName = faker.name.firstName();
  user.lastName = faker.name.lastName();
  user.birth = '1990-1-30';
  user.password = 'password';

  return user;
});
