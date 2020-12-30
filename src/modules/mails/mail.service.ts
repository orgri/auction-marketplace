import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { MailTemplate } from './mail-types';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    template: MailTemplate,
    mailOptions: ISendMailOptions,
  ): Promise<void> {
    this.mailerService
      .sendMail({
        ...mailOptions,
        template,
      })
      .catch((error) => {
        this.logger.warn(error);
      });
  }
}
