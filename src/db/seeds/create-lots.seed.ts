import { Bid, Lot, LotStatus } from '../models';
import { Factory, Seeder } from 'typeorm-seeding';
import {
  SEED_BIDS_PER_LOTS,
  SEED_LOTS_PER_STATUS,
  SEED_N_USERS,
} from '../seed-constants';

export default class CreateLots implements Seeder {
  public async run(factory: Factory): Promise<void> {
    for (let id = 1; id <= SEED_N_USERS; id++) {
      await factory(Lot)().createMany(SEED_LOTS_PER_STATUS, {
        ownerId: id,
        status: LotStatus.pending,
      });

      const inProcessLots = await factory(Lot)().createMany(
        SEED_LOTS_PER_STATUS,
        {
          ownerId: id,
          status: LotStatus.inProcess,
        },
      );

      inProcessLots.forEach(async (lot) => {
        await factory(Bid)(id).createMany(SEED_BIDS_PER_LOTS, {
          lotId: lot.id,
          currentPrice: lot.currentPrice,
        });
      });

      const closedLots = await factory(Lot)().createMany(SEED_LOTS_PER_STATUS, {
        ownerId: id,
        status: LotStatus.closed,
      });

      closedLots.forEach(async (lot) => {
        await factory(Bid)(id).createMany(SEED_BIDS_PER_LOTS, {
          lotId: lot.id,
          currentPrice: lot.currentPrice,
        });
      });
    }
  }
}
