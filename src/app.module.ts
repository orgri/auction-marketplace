import { Module } from '@nestjs/common';
import {
  AuthModule,
  BidModule,
  DatabaseModule,
  LotModule,
  UserModule,
} from './modules';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, LotModule, BidModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
