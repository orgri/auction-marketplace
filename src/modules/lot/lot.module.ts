import { LotService } from './lot.service';
import { Module } from '@nestjs/common';
import { LotController } from './lot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lot } from '../../db/models';
import { QueueModule } from '../tasks/queue.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lot]), QueueModule],
  controllers: [LotController],
  providers: [LotService],
  exports: [LotService],
})
export class LotModule {}
