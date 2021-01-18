import { AuthModule } from './modules/auth/auth.module';
import { BidModule } from './modules/bid/bid.module';
import { DatabaseModule } from './modules/database/database.module';
import { LotModule } from './modules/lot/lot.module';
import { MailModule } from './modules/mails/mail.module';
import { OrderModule } from './modules/order/order.module';
import { QueueModule } from './modules/tasks/queue.module';
import { QueueConsumerModule } from './modules/tasks/queue-consumer.module';
import { UserModule } from './modules/user/user.module';
import { WebsocketsModule } from './modules/websockets/websockets.module';

export const controllerModules = [
  UserModule,
  AuthModule,
  LotModule,
  BidModule,
  OrderModule,
];

export const commonModules = [
  DatabaseModule,
  QueueModule,
  QueueConsumerModule,
  MailModule,
  WebsocketsModule,
];
