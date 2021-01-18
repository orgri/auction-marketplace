import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { SEED_BIDS_PER_LOTS } from '../seed-constants';
import { Bid, Lot, LotStatus } from '../models';

export default class CreateBids implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const lots = await connection
      .createQueryBuilder(Lot, 'lots')
      .where('NOT lots.status = :status', {
        status: LotStatus.pending,
      })
      .getMany();

    for await (const lot of lots) {
      await factory(Bid)(lot.ownerId).createMany(SEED_BIDS_PER_LOTS, {
        lotId: lot.id,
        currentPrice: lot.currentPrice,
      });
    }
  }
}
