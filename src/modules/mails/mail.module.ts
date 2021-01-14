import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { MailConfig } from './mail.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        ...MailConfig,
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
