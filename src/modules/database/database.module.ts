import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig, SeedsConfig } from './type-orm.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        ...TypeOrmConfig,
        ...SeedsConfig,
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class DatabaseModule {}
