import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from 'src/common/exceptions';
import { isFirstDateLater } from 'src/common/validations';
import { DeleteResult, Repository } from 'typeorm';
import { TasksService } from '../tasks/tasks.service';
import { LotCreateDto, LotUpdateDto } from './dto';
import { Lot, LotStatus } from 'src/db/models';

const NOT_ALLOWED_STATUSES = [LotStatus.inProcess, LotStatus.closed];

@Injectable()
export class LotService {
  private readonly logger = new Logger(LotService.name);

  constructor(
    @InjectRepository(Lot)
    private readonly repo: Repository<Lot>,
    private readonly tasksService: TasksService,
  ) {}

  async createOne(ownerId: number, payload: LotCreateDto): Promise<Lot> {
    this.validate(payload);

    return this.repo
      .save({ ...payload, ownerId })
      .then((lot) => {
        this.tasksService.scheduleChangeStatus(
          lot.startAt,
          lot.id,
          lot.ownerId,
        );
        return lot;
      })
      .catch((error) => {
        this.logger.error(error);
        throw new ValidationException(['You are not able to create a lot']);
      });
  }

  async updateOne(
    ownerId: number,
    id: number,
    payload: LotUpdateDto,
  ): Promise<Lot> {
    const lot = await this.getByID(id);
    this.validateLot(ownerId, id, lot);
    this.repo.merge(lot, payload);
    this.validate(lot);

    return this.repo
      .save(lot)
      .then((updatedLot) => {
        this.tasksService.scheduleChangeStatus(
          updatedLot.startAt,
          updatedLot.id,
          updatedLot.ownerId,
        );
        return updatedLot;
      })
      .catch((error) => {
        this.logger.error(error);
        throw new ValidationException(['You are not able to update a lot']);
      });
  }

  async deleteOne(ownerId: number, id: number): Promise<DeleteResult> {
    const lot = await this.getByID(id);
    this.validateLot(ownerId, id, lot);

    return this.repo.delete({ id }).catch((error) => {
      this.logger.error(error);
      throw new ValidationException(['You are not able to delete a lot']);
    });
  }

  async getAll(page: number, limit: number): Promise<Lot[]> {
    const skip = limit * (page - 1);

    return this.repo.find({
      where: { status: LotStatus.inProcess },
      skip: skip,
      take: limit,
    });
  }

  async getMy(ownerId: number, page: number, limit: number): Promise<Lot[]> {
    const skip = limit * (page - 1);

    return this.repo.find({
      where: { ownerId },
      skip: skip,
      take: limit,
    });
  }

  async getByID(id: number): Promise<Lot> {
    return this.repo.findOne({ id });
  }

  validate(payload: LotCreateDto | LotUpdateDto) {
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

    if (ownerId != lot.ownerId) {
      throw new ForbiddenException('Forbidden resourse!');
    }

    if (NOT_ALLOWED_STATUSES.includes(lot.status)) {
      throw new ValidationException([
        `You are not able to update/delete a lot in "${lot.status}" status`,
      ]);
    }
  }
}
