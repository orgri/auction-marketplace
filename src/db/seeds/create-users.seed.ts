import { User } from '../models';
import { Factory, Seeder } from 'typeorm-seeding';
import { SEED_N_USERS } from '../seed-constants';

export default class CreateUsers implements Seeder {
  public async run(factory: Factory): Promise<void> {
    for (let id = 0; id < SEED_N_USERS; id++) {
      await factory(User)(id).create();
    }
  }
}
