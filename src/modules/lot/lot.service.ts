import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '../../common/exceptions';
import { isFirstDateLater } from '../../common/validations';
import { DeleteResult, Repository } from 'typeorm';
import { LotCreateDto, LotFilterDto, LotUpdateDto, QueryDto } from './dto';
import { Bid, Lot, LotStatus } from '../../db/models';
import { QueueService } from '../tasks/queue.service';
import { JobAction } from '../tasks/job-types';

const NOT_ALLOWED_STATUSES = [LotStatus.inProcess, LotStatus.closed];

@Injectable()
export class LotService {
  private readonly logger = new Logger(LotService.name);

  constructor(
    @InjectRepository(Lot)
    private readonly repo: Repository<Lot>,
    private readonly queueService: QueueService,
  ) {}

  async createOne(ownerId: number, payload: LotCreateDto): Promise<Lot> {
    this.validate(payload);

    try {
      const createdLot = await this.repo.save({ ownerId, ...payload });
      // change status to in_process by job using queue
      // change status to closed by job using queue
      const delayChange = Date.parse(createdLot.startAt) - Date.now();
      const delayClose = Date.parse(createdLot.endAt) - Date.now();
      this.queueService.addJob(JobAction.changeLotStatus, createdLot, {
        delay: delayChange,
      });
      this.queueService.addJob(JobAction.closelot, createdLot, {
        delay: delayClose,
      });

      return createdLot;
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException(['You are not able to create a lot']);
    }
  }

  async updateOne(
    ownerId: number,
    id: number,
    payload: LotUpdateDto,
  ): Promise<Lot> {
    const lot = await this.getByID(id);
    this.validateLot(ownerId, id, lot);
    const data = this.repo.create({ ...lot, ...payload });
    this.validate(data);

    try {
      const updatedLot = await this.repo.save(data);

      if (payload.startAt) {
        const delayStart = Date.parse(updatedLot.startAt) - Date.now();
        this.queueService.addJob(JobAction.changeLotStatus, updatedLot, {
          delay: delayStart,
        });
      }

      if (payload.endAt) {
        const delayEnd = Date.parse(updatedLot.endAt) - Date.now();
        this.queueService.addJob(JobAction.closelot, updatedLot, {
          delay: delayEnd,
        });
      }

      return updatedLot;
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException(['You are not able to update a lot']);
    }
  }

  async deleteOne(ownerId: number, id: number): Promise<DeleteResult> {
    const lot = await this.getByID(id);
    this.validateLot(ownerId, id, lot);

    try {
      const result = await this.repo.delete({ id });

      this.queueService.removeJob(
        await this.queueService.getJobID(JobAction.changeLotStatus, lot),
      );

      this.queueService.removeJob(
        await this.queueService.getJobID(JobAction.closelot, lot),
      );

      return result;
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException(['You are not able to delete a lot']);
    }
  }

  async getAll(page: number, limit: number): Promise<Lot[]> {
    const skip = limit * (page - 1);

    return this.repo.find({
      where: { status: LotStatus.inProcess },
      skip: skip,
      take: limit,
    });
  }

  async getMy(
    ownerId: number,
    query: QueryDto,
    body: LotFilterDto,
  ): Promise<Lot[]> {
    // TODO:
    // + add to the list lots with my Bids
    // add filters:
    // + created (return only lots that user create for sale)
    // + participation (return only lots that user won/try to win)
    // + all (created + participated)

    const { page, limit } = query;
    const lotsOwnerId = body.isOwned ? ownerId : null;
    const bidsOwnerId = body.isParticipated ? ownerId : null;
    const skip = limit * (page - 1);

    return await this.repo
      .createQueryBuilder()
      .select('lots')
      .from(Lot, 'lots')
      .where('lots.owner_id = :lotsOwnerId', { lotsOwnerId })
      .orWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .distinct(true)
          .select('bids.lot_id')
          .from(Bid, 'bids')
          .where('bids.owner_id = :bidsOwnerId', { bidsOwnerId })
          .getQuery();
        return 'lots.id IN ' + subQuery;
      })
      .groupBy('lots.id')
      .orderBy('lots.status', 'ASC')
      .skip(skip)
      .take(limit)
      .getMany();
  }

  async getByID(id: number): Promise<Lot> {
    return this.repo.findOne({ id });
  }

  async getOneLotWithBids(
    id: number,
    offset: number,
    limit: number,
  ): Promise<Lot> {
    return this.repo
      .createQueryBuilder('lots')
      .leftJoinAndSelect('lots.bids', 'bids')
      .where('lots.id = :id', { id })
      .groupBy('lots.id, bids.id')
      .orderBy('bids.proposed_price', 'DESC')
      .offset(offset)
      .limit(limit)
      .getOne();
  }

  async update(data: any): Promise<Lot> {
    return this.repo.save({ ...data });
  }

  validate(payload: any) {
    const { currentPrice, estimetedPrice, startAt, endAt } = payload;

    if (estimetedPrice < currentPrice) {
      throw new ValidationException([
        'estimetedPrice must be grater than currentPrice',
      ]);
    }

    if (isFirstDateLater(new Date(), startAt)) {
      throw new ValidationException([
        'startAt must be later than current time',
      ]);
    }

    if (isFirstDateLater(startAt, endAt)) {
      throw new ValidationException(['endAt must be later than startAt']);
    }
  }

  validateLot(ownerId: number, id: number, lot: any) {
    if (!lot) {
      throw new NotFoundException(`Not found lot with id: ${id}`);
    }

    if (ownerId !== lot.ownerId) {
      throw new ForbiddenException('Forbidden resourse!');
    }

    if (NOT_ALLOWED_STATUSES.includes(lot.status)) {
      throw new ValidationException([
        `You are not able to update/delete a lot in "${lot.status}" status`,
      ]);
    }
  }
}
