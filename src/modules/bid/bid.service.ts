import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '../../../src/common/exceptions';
import { DeleteResult, Repository } from 'typeorm';
import { Bid, Lot, LotStatus } from '../../../src/db/models';
import { BidCreateDto } from './dto/bid-create.dto';
import { LotService } from '../lot/lot.service';

const NOT_ALLOWED_STATUSES = [LotStatus.pending, LotStatus.closed];

@Injectable()
export class BidService {
  private readonly logger = new Logger(BidService.name);

  constructor(
    @InjectRepository(Bid)
    private readonly repo: Repository<Bid>,
    private readonly lotService: LotService,
  ) {}

  async createOne(
    ownerId: number,
    lotId: number,
    payload: BidCreateDto,
  ): Promise<Bid> {
    const { proposedPrice } = payload;
    const lot = await this.lotService.getByID(lotId);
    this.validateLot(lot, ownerId, proposedPrice);

    // TODO:
    // websockets: sent this bid
    // change status to closed if proposedPrice > lot.estimatedPrice
    // notify owner of lot
    // notify winner of lot

    try {
      const bid = await this.repo.save({
        ownerId,
        lotId,
        currentPrice: lot.currentPrice,
        ...payload,
      });
      await this.lotService.update({ ...lot, currentPrice: proposedPrice });
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
      throw new ValidationException(['You are not able to create a bid']);
    }
  }

  async getAll(
    ownerId: number,
    lotId: number,
    page: number,
    limit: number,
  ): Promise<any> {
    const lot = await this.lotService.getByID(lotId);

    if (!lot) {
      throw new NotFoundException(`Not found lot with id: ${lotId}`);
    }

    if (lot.ownerId !== ownerId && lot.status === LotStatus.pending) {
      throw new ForbiddenException('Forbidden resourse!');
    }

    const skip = limit * (page - 1);
    // Think about:
    // Currently it is implemented by two queries to DB
    // maybe better do it by one query with relation(join tables)?
    const bids = await this.repo.find({
      where: { lotId },
      skip: skip,
      take: limit,
    });

    const isUserHasBids = bids.find((bid) => bid.ownerId === ownerId);

    if (
      lot.ownerId !== ownerId &&
      lot.status === LotStatus.closed &&
      !isUserHasBids
    ) {
      throw new ForbiddenException('Forbidden resourse!');
    }

    return { lot, bids };
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
  }
}