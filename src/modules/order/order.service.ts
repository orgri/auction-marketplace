import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '../../common/exceptions';
import { DeleteResult, Repository } from 'typeorm';
import { Lot, LotStatus, Order, OrderStatus } from '../../db/models';
import { LotService } from '../lot/lot.service';
import { MailTemplate } from '../mails/mail-types';
import { JobAction } from '../tasks/job-types';
import { QueueService } from '../tasks/queue.service';
import { OrderCreateDto, OrderChangeStatusDto, OrderUpdateDto } from './dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
    private readonly lotService: LotService,
    private readonly queueService: QueueService,
  ) {}

  async createOne(
    ownerId: number,
    lotId: number,
    body: OrderCreateDto,
  ): Promise<Order> {
    const lot = await this.lotService.getLotWinner(lotId);
    this.validate(ownerId, body.bidId, lot);

    try {
      const order = await this.repo.save({ ...body });

      this.queueService.addJob(JobAction.orderMail, {
        id: lotId,
        ownerId,
        template: MailTemplate.newOrder,
      });

      return order;
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException(['You are not able to create an order']);
    }
  }

  async updateOne(
    ownerId: number,
    lotId: number,
    body: OrderUpdateDto,
  ): Promise<Order> {
    const order = await this.repo.findOne(body.id, { relations: ['bid'] });
    this.validateOrder(ownerId, order);

    try {
      const updatedOrder = await this.repo.save(
        this.repo.merge(order, { ...body }),
      );

      this.queueService.addJob(JobAction.orderMail, {
        id: lotId,
        ownerId,
        template: MailTemplate.updatedOrder,
      });

      return updatedOrder;
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException(['You are not able to update an order']);
    }
  }

  async deleteOne(
    ownerId: number,
    body: OrderUpdateDto,
  ): Promise<DeleteResult> {
    const { id } = body;
    const order = await this.repo.findOne(id, { relations: ['bid'] });
    this.validateOrder(ownerId, order);

    try {
      return await this.repo.delete({ id });
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException(['You are not able to delete an order']);
    }
  }

  async changeStatus(
    ownerId: number,
    lotId: number,
    body: OrderChangeStatusDto,
  ): Promise<Order> {
    const order = await this.getOne(ownerId, lotId);
    this.validateStatusChange(ownerId, body.status, order);

    try {
      const changedOrder = await this.repo.save(
        this.repo.merge(order, { ...body }),
      );

      let template: MailTemplate;

      switch (changedOrder.status) {
        case OrderStatus.sent:
          template = MailTemplate.sentOrder;
          break;
        case OrderStatus.delivered:
          template = MailTemplate.deliveredOrder;
          break;
      }

      this.queueService.addJob(JobAction.orderMail, {
        id: lotId,
        ownerId,
        template,
      });

      return changedOrder;
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException([
        'You are not able to update status of order',
      ]);
    }
  }

  async getOne(userId: number, lotId: number): Promise<Order> {
    const order = await this.repo.findOne({
      join: {
        alias: 'order',
        leftJoinAndSelect: { bid: 'order.bid', lot: 'bid.lot' },
      },
      where: (qb) => {
        qb.where('bid.lot_id = :lotId', { lotId });
      },
    });

    if (![order.bid.ownerId, order.bid.lot.ownerId].includes(userId))
      throw new ForbiddenException('Forbidden resourse!');

    return order;
  }

  validate(ownerId: number, bidId: number, lot: Lot) {
    if (!lot) {
      throw new NotFoundException(`Not found order of requested id`);
    }

    if (!lot.bids.length) {
      throw new NotFoundException(`Not found bids for requested lot`);
    }

    if (ownerId !== lot.bids[0].ownerId) {
      throw new ForbiddenException('Forbidden resourse!');
    }

    if (bidId !== lot.bids[0].id) {
      throw new BadRequestException(
        `Bid with id: ${bidId} is not winner of lot`,
      );
    }

    if (lot.status !== LotStatus.closed) {
      throw new ValidationException([
        `Posssible to create order only in "${LotStatus.closed}" status`,
      ]);
    }
  }

  validateOrder(ownerId: number, order: Order) {
    if (!order) {
      throw new NotFoundException(`Not found order of requested id`);
    }

    if (ownerId !== order.bid.ownerId) {
      throw new ForbiddenException('Forbidden resourse!');
    }

    if (order.status !== OrderStatus.pending) {
      throw new ValidationException([
        `Posssible to update/delete order only in "${OrderStatus.pending}" status`,
      ]);
    }
  }

  validateStatusChange(ownerId: number, status: OrderStatus, order: Order) {
    if (!order) {
      throw new NotFoundException(`Not found order of requested id`);
    }

    const isAbleSwitchToSent =
      status === OrderStatus.sent &&
      order.status === OrderStatus.pending &&
      ownerId === order.bid.lot.ownerId;

    const isAbleSwitchToDelivered =
      status === OrderStatus.delivered &&
      order.status === OrderStatus.sent &&
      ownerId === order.bid.ownerId;

    if (!(isAbleSwitchToSent || isAbleSwitchToDelivered)) {
      throw new ValidationException([
        `You can not switch status from "${order.status}" to "${status}"`,
      ]);
    }
  }
}
