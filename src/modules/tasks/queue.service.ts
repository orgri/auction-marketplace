import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { JobOptions, Queue } from 'bull';
import { Duration } from 'luxon';
import { QueueName } from './job-types';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QueueName.statesFlow) private readonly queue: Queue,
  ) {}

  async getJobID(name: string, data: any): Promise<string> {
    if (data.id && data.ownerId) return `${name}-${data.id}-${data.ownerId}`;
    return undefined;
  }

  async addJob(
    name: string,
    data: any,
    options: JobOptions = {},
  ): Promise<void> {
    const jobId = await this.getJobID(name, data);

    await this.removeJob(jobId);

    this.queue.add(name, data, {
      jobId,
      attempts: 5,
      ...options,
    });

    const dur = Duration.fromMillis(options.delay)
      .shiftTo('days', 'hours', 'minutes')
      .toObject();

    this.logger.warn(
      `job ${jobId} was ADDED with delay: ${dur.days}d ${
        dur.hours
      }h ${dur.minutes.toFixed(1)}m`,
    );
  }

  async removeJob(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId);

    if (job) {
      this.queue.removeJobs(jobId);
      this.logger.warn(`job ${jobId} was REMOVED!`);
    }
  }
}
