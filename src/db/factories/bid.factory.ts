import * as Faker from 'faker';
import { define } from 'typeorm-seeding';
import { Bid } from '../models';
import {
  MAX_CURRENT_PRICE,
  MIN_ESTIMATED_PRICE,
  SEED_N_USERS,
} from '../seed-constants';

define(Bid, (faker: typeof Faker, ownerId: number) => {
  const bid = new Bid();

  bid.proposedPrice = +faker.finance.amount(
    MAX_CURRENT_PRICE + 1,
    MIN_ESTIMATED_PRICE,
  );
  bid.ownerId = faker.random.number({ min: 1, max: SEED_N_USERS });

  // To avoid same owner for lot and corrresponding bids
  if (bid.ownerId === ownerId)
    bid.ownerId = Math.floor((ownerId + SEED_N_USERS) / 3);

  return bid;
});
