import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LotModule } from '../lot/lot.module';
import { QueueName } from './job-types';
import { AuctionFlowConsumer } from './queue.consumer';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: QueueName.statesFlow,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => LotModule),
  ],
  providers: [AuctionFlowConsumer, QueueService],
  exports: [QueueService],
})
export class QueueModule {}
