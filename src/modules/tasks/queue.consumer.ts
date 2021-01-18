import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { LotStatus } from '../../db/models';
import { LotService } from '../lot/lot.service';
import { MailTemplate } from '../mails/mail-types';
import { MailService } from '../mails/mail.service';
import { JobAction, QueueName } from './job-types';

@Processor(QueueName.statesFlow)
export class QueueConsumer {
  private readonly logger = new Logger(QueueConsumer.name);

  constructor(
    private readonly lotService: LotService,
    private readonly mailService: MailService,
  ) {}

  @Process({ name: JobAction.changeLotStatus, concurrency: 10 })
  async processLotStatus(job: Job) {
    await this.lotService.update({
      id: job.data.id,
      status: LotStatus.inProcess,
    });

    this.logger.warn(
      `job ${job.id} scheduled to ${job.data.startAt} has been EXECUTED!`,
    );
  }

  @Process({ name: JobAction.closeLot, concurrency: 10 })
  async closeLot(job: Job) {
    const { id } = job.data;
    await this.lotService.update({ id, status: LotStatus.closed });

    const lot = await this.lotService.getLotWinner(id);
    const isWinnerClose = lot.bids.length > 0;

    const template = isWinnerClose
      ? MailTemplate.winnerClose
      : MailTemplate.noWinnerClose;

    const lotLink = `/lots/${lot.id}/bids`;

    this.mailService.sendMail(template, {
      to: lot.owner.email,
      subject: 'Auction for your lot has been closed',
      context: {
        ownerName: lot.owner.firstName,
        winnerPrice: lot.currentPrice,
        lotTitle: lot.title,
        lotLink,
      },
    });

    this.logger.warn(
      `sending email to OWNER(${lot.owner.email}) of lot(${lot.id})`,
    );

    if (isWinnerClose) {
      const { owner: winner, proposedPrice } = lot.bids[0];

      const createOrderLink = `/lots/${lot.id}/order/create`;

      this.mailService.sendMail(MailTemplate.lotWinner, {
        to: winner.email,
        subject: 'You won the auction!',
        context: {
          winnerName: winner.firstName,
          winnerPrice: proposedPrice,
          lotTitle: lot.title,
          lotLink,
          createOrderLink,
        },
      });

      this.logger.warn(
        `sending email to WINNER(${winner.email}) of lot(${lot.id})`,
      );
    }

    this.logger.warn(
      `job ${job.id} scheduled to ${job.data.endAt} has been EXECUTED!`,
    );
  }

  @Process({ name: JobAction.orderMail, concurrency: 10 })
  async orderMail(job: Job) {
    const { id, template } = job.data;
    const lot = await this.lotService.getLotWinner(id);
    const lotLink = `/lots/${lot.id}/bids`;

    let to: string, subject: string, ownerName: string;

    switch (template) {
      case MailTemplate.newOrder:
        to = lot.owner.email;
        subject = 'You have a new order!';
        ownerName = lot.owner.firstName;
        break;

      case MailTemplate.updatedOrder:
        to = lot.owner.email;
        subject = 'Order has been updated!';
        ownerName = lot.owner.firstName;
        break;

      case MailTemplate.sentOrder:
        to = lot.bids[0].owner.email;
        subject = 'Order status has been changed!';
        ownerName = lot.bids[0].owner.firstName;
        break;

      case MailTemplate.deliveredOrder:
        to = `${lot.owner.email}, ${lot.bids[0].owner.email}`;
        subject = 'The order has been delivered!';
        break;
    }

    this.mailService.sendMail(template, {
      to,
      subject,
      context: {
        ownerName,
        lotTitle: lot.title,
        lotLink,
      },
    });

    this.logger.warn(`sending order email to ${to} with template(${template})`);

    this.logger.warn(`job ${job.id} has been EXECUTED!`);
  }
}
