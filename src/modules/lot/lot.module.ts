import { LotService } from './lot.service';
import { Module } from '@nestjs/common';
import { LotController } from './lot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lot } from 'src/db/models';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lot]), TasksModule],
  controllers: [LotController],
  providers: [LotService],
  exports: [LotService],
})
export class LotModule {}
