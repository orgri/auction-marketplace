import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '../config';
import { QueueName } from './job-types';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: QueueName.statesFlow,
      imports: [ConfigModule],
      useFactory: async (cfg: ConfigService) => cfg.getRedisConfig(),
      inject: [ConfigService],
    }),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
