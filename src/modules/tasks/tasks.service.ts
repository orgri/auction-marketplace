import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { Repository } from 'typeorm';
import { Lot, LotStatus } from '../../db/models';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Lot)
    private readonly repo: Repository<Lot>,
    private readonly scheduler: SchedulerRegistry,
  ) {}

  async scheduleChangeStatus(time: string, id: number, ownerId: number) {
    const name = `changeStatus-${id}-${ownerId}`;

    const job = new CronJob(new Date(time), () => {
      this.repo.save({ id, status: LotStatus.inProcess });
      this.logger.warn(`job ${name} at ${time} was EXECUTED!`);
    });

    if (this.scheduler.getCronJobs().has(name)) {
      this.scheduler.deleteCronJob(name);
      this.logger.warn(`job ${name} at ${time} was DELETED!`);
    }

    this.scheduler.addCronJob(name, job);
    job.start();

    this.logger.warn(`job ${name} at ${time} was ADDED!`);
  }
}
