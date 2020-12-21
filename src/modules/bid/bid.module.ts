import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from '../../../src/db/models';
import { LotModule } from '../lot/lot.module';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bid]), LotModule],
  controllers: [BidController],
  providers: [BidService],
})
export class BidModule {}
