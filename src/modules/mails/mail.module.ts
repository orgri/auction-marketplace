import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import * as mailConfig from './mail.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        ...mailConfig,
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
