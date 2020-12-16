import * as Faker from 'faker';
import { define } from 'typeorm-seeding';
import { Lot } from '../models';

define(Lot, (faker: typeof Faker) => {
  const lot = new Lot();

  lot.ownerId = faker.random.number({ min: 1, max: 9 });
  lot.title = faker.commerce.productName();
  lot.description = faker.lorem.text();
  lot.currentPrice = +faker.finance.amount(1, 1000);
  lot.estimetedPrice = +faker.finance.amount(1001, 5000);
  lot.startAt = faker.date.future(0.05, new Date()).toJSON();
  lot.endAt = faker.date.future(0.5, new Date()).toJSON();

  return lot;
});
