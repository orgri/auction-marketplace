import { Module } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lot } from '../lot/lot.entity';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lot])],
  providers: [TasksService, SchedulerRegistry],
  exports: [TasksService],
})
export class TasksModule {}
