import { Lot } from '../models';
import { Factory, Seeder } from 'typeorm-seeding';

export default class CreateLots implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(Lot)().createMany(30);
  }
}
