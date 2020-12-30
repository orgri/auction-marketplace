import { Module } from '@nestjs/common';
import {
  AuthModule,
  BidModule,
  DatabaseModule,
  LotModule,
  UserModule,
} from './modules';
import { MailModule } from './modules/mails/mail.module';
import { QueueModule } from './modules/tasks/queue.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    LotModule,
    BidModule,
    QueueModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
