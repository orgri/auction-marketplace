import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { SEED_LOTS_PER_STATUS } from '../seed-constants';
import { Lot, LotStatus, User } from '../models';

export default class CreateLots implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const users = await connection.createQueryBuilder(User, 'user').getMany();

    for await (const user of users) {
      await factory(Lot)().createMany(SEED_LOTS_PER_STATUS, {
        ownerId: user.id,
        status: LotStatus.pending,
      });

      await factory(Lot)().createMany(SEED_LOTS_PER_STATUS, {
        ownerId: user.id,
        status: LotStatus.inProcess,
      });

      await factory(Lot)().createMany(SEED_LOTS_PER_STATUS, {
        ownerId: user.id,
        status: LotStatus.closed,
      });
    }
  }
}
