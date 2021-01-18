import { Module } from '@nestjs/common';
import { QueueConsumer } from './queue.consumer';
import { LotModule } from '../lot/lot.module';
import { MailModule } from '../mails/mail.module';

@Module({
  imports: [LotModule, MailModule],
  providers: [QueueConsumer],
  exports: [],
})
export class QueueConsumerModule {}
