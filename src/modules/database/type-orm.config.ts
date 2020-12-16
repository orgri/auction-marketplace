import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

const dir = path.relative(process.cwd(), path.resolve(`${__dirname}/../../db`));
const env = dotenv.parse(fs.readFileSync('.env'));
const configService = new ConfigService(env);

module.exports = {
  name: 'default',
  type: 'postgres',
  host: configService.get('POSTGRES_HOST', 'localhost'),
  port: configService.get<number>('POSTGRES_PORT', 5432),
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DATABASE'),
  entities: [`${dir}/models/**/*.entity{.ts,.js}`],
  migrationsTableName: 'migration',
  seeds: [`${dir}/seeds/**/*.seed{.ts,.js}`],
  factories: [`${dir}/factories/**/*{.ts,.js}`],
  migrations: [`${dir}/migrations/*.ts`],

  cli: {
    migrationsDir: `${dir}/migrations`,
  },
  namingStrategy: new SnakeNamingStrategy(),
};
