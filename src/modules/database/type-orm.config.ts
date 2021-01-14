import * as path from 'path';
import { ReadConfig } from '../../common/read-config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const dir = path.relative(process.cwd(), path.resolve(`${__dirname}/../../db`));
const config = new ReadConfig();

export const TypeOrmConfig: TypeOrmModuleOptions = {
  name: 'default',
  type: 'postgres',
  host: config.getString('POSTGRES_HOST'),
  port: config.getInt('POSTGRES_PORT'),
  username: config.getString('POSTGRES_USER'),
  password: config.getString('POSTGRES_PASSWORD'),
  database: config.getString('POSTGRES_DATABASE'),
  entities: [`${dir}/models/**/*.entity{.ts,.js}`],
  migrationsTableName: 'migration',
  migrations: [`${dir}/migrations/*.ts`],
  cli: {
    migrationsDir: `${dir}/migrations`,
  },
  namingStrategy: new SnakeNamingStrategy(),
};

export const SeedsConfig = {
  seeds: [`${dir}/seeds/**/*.seed{.ts,.js}`],
  factories: [`${dir}/factories/**/*{.ts,.js}`],
};
