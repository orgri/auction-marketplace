import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '../../common/exceptions';
import { DeleteResult, Repository } from 'typeorm';
import { Bid, Lot, LotStatus } from '../../db/models';
import { BidCreateDto } from './dto/bid-create.dto';
import { LotService } from '../lot/lot.service';
import { QueueService } from '../tasks/queue.service';
import { JobAction } from '../tasks/job-types';
import { WebsocketsGateway } from '../websockets/websockets.gateway';

const NOT_ALLOWED_STATUSES = [LotStatus.pending, LotStatus.closed];

@Injectable()
export class BidService {
  private readonly logger = new Logger(BidService.name);

  constructor(
    @InjectRepository(Bid)
    private readonly repo: Repository<Bid>,
    private readonly lotService: LotService,
    private readonly queueService: QueueService,
    private websockets: WebsocketsGateway,
  ) {}

  async createOne(
    ownerId: number,
    lotId: number,
    payload: BidCreateDto,
  ): Promise<Bid> {
    const { proposedPrice } = payload;
    const lot = await this.lotService.getByID(lotId);
    this.validateLot(lot, ownerId, proposedPrice);

    try {
      const bid = await this.repo.save({
        ownerId,
        lotId,
        currentPrice: lot.currentPrice,
        ...payload,
      });

      this.websockets.publishEventToRoom(`lot-${lotId}`, 'newBid', bid);

      await this.lotService.update({
        ...lot,
        currentPrice: proposedPrice,
      });

      if (proposedPrice >= lot.estimetedPrice) {
        this.queueService.addJob(JobAction.closeLot, lot);
      }

      return bid;
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException(['You are not able to create a bid']);
    }
  }

  async deleteOne(
    ownerId: number,
    lotId: number,
    id: number,
  ): Promise<DeleteResult> {
    // TODO:
    // if delete bid with the highest proposedPrice,
    // than estimetedPrice for lot must be changed to next the highest price in bids
    // if there are no bids get it from currentPrice in bid

    try {
      const lot = await this.lotService.getByID(lotId);
      this.validateLot(lot, ownerId, lot.estimetedPrice);
      return await this.repo.delete({ id });
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException(['You are not able to delete a bid']);
    }
  }

  async getAll(
    ownerId: number,
    lotId: number,
    page: number,
    limit: number,
  ): Promise<Lot> {
    const skip = limit * (page - 1);
    const lot = await this.lotService.getOneLotWithBids(lotId, skip, limit);

    if (!lot) {
      throw new NotFoundException(`Not found lot with id: ${lotId}`);
    }

    if (lot.ownerId !== ownerId && lot.status === LotStatus.pending) {
      throw new ForbiddenException('Forbidden resourse!');
    }

    return lot;
  }

  async getWinnerBid(lotId: number): Promise<Bid> {
    return this.repo.findOne({
      where: { lotId },
      order: { proposedPrice: 'DESC' },
      relations: ['owner', 'lot', 'lot.owner'],
    });
  }

  validateLot(lot: Lot, ownerId?: number, proposedPrice?: number) {
    if (!lot) {
      throw new NotFoundException(`Not found lot with id: ${lot.id}`);
    }

    if (ownerId === lot.ownerId) {
      throw new ForbiddenException(
        'You cannot create/delete bid if you are owner of lot',
      );
    }

    if (NOT_ALLOWED_STATUSES.includes(lot.status)) {
      throw new ValidationException([
        `You are not able to create/delete bid for lot in "${lot.status}" status`,
      ]);
    }

    if (proposedPrice <= lot.currentPrice) {
      throw new ValidationException([
        `You are not able to create bid with equal or less proposedPrice than currentPrice`,
      ]);
    }

    // to avoid situation when bid with estimetedPrice was created, but status is not changed to closed yet
    if (lot.currentPrice >= lot.estimetedPrice) {
      throw new ValidationException([`You are not able to create bid`]);
    }
  }
}
