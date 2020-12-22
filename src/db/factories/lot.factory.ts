import * as Faker from 'faker';
import { define } from 'typeorm-seeding';
import { Lot, LotStatus } from '../models';
import {
  MAX_CURRENT_PRICE,
  MAX_ESTIMATED_PRICE,
  MIN_CURRENT_PRICE,
  MIN_ESTIMATED_PRICE,
  SEED_N_USERS,
} from '../seed-constants';

define(Lot, (faker: typeof Faker) => {
  const lot = new Lot();

  lot.ownerId = faker.random.number({ min: 1, max: SEED_N_USERS });
  lot.title = faker.commerce.productName();
  lot.description = faker.lorem.text();
  lot.currentPrice = +faker.finance.amount(
    MIN_CURRENT_PRICE,
    MAX_CURRENT_PRICE,
  );
  lot.estimetedPrice = +faker.finance.amount(
    MIN_ESTIMATED_PRICE,
    MAX_ESTIMATED_PRICE,
  );
  lot.startAt = faker.date.future(0.05, new Date()).toJSON();
  lot.endAt = faker.date.future(0.5, new Date()).toJSON();
  lot.status = faker.random.arrayElement([
    LotStatus.pending,
    LotStatus.inProcess,
    LotStatus.closed,
  ]);

  return lot;
});
