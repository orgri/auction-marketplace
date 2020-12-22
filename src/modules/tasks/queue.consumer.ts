import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { LotStatus } from '../../../src/db/models';
import { LotService } from '../lot/lot.service';
import { JobAction, QueueName } from './job-types';

@Processor(QueueName.statesFlow)
export class AuctionFlowConsumer {
  private readonly logger = new Logger(AuctionFlowConsumer.name);

  constructor(private readonly lotService: LotService) {}

  @Process({ name: JobAction.changeLotStatus })
  processLotStatus(job: Job) {
    this.logger.warn(job.data);
    this.lotService.update({ id: job.data.id, status: LotStatus.inProcess });
    this.logger.warn(`job ${job.id} at ${job.data.startAt} was EXECUTED!`);
  }

  @Process({ name: JobAction.closelot })
  closeLot(job: Job) {
    this.logger.warn(job.data);
    this.lotService.update({ id: job.data.id, status: LotStatus.closed });
    this.logger.warn(`job ${job.id} at ${job.data.endAt} was EXECUTED!`);
  }
}
