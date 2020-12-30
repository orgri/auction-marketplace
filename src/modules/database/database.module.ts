import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as typeOrmConfig from './type-orm.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        ...typeOrmConfig,
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class DatabaseModule {}
