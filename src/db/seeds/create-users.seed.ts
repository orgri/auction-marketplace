import { User } from '../models';
import { Factory, Seeder } from 'typeorm-seeding';

export default class CreateUsers implements Seeder {
  public async run(factory: Factory): Promise<void> {
    // Generate 10 users.
    const amount = 10;

    for (let id = 0; id < amount; id++) {
      await factory(User)(id).create();
    }
  }
}
