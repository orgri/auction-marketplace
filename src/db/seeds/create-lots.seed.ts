import { Lot, LotStatus } from '../models';
import { Factory, Seeder } from 'typeorm-seeding';

export default class CreateLots implements Seeder {
  public async run(factory: Factory): Promise<void> {
    for (let id = 1; id <= 10; id++) {
      await factory(Lot)().createMany(5, {
        ownerId: id,
        status: LotStatus.pending,
      });
      await factory(Lot)().createMany(5, {
        ownerId: id,
        status: LotStatus.inProcess,
      });
      await factory(Lot)().createMany(5, {
        ownerId: id,
        status: LotStatus.closed,
      });
    }
  }
}
