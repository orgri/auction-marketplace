import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from '../../../src/db/models';
import { LotModule } from '../lot/lot.module';
import { QueueModule } from '../tasks/queue.module';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bid]), LotModule, QueueModule],
  controllers: [BidController],
  providers: [BidService],
})
export class BidModule {}
