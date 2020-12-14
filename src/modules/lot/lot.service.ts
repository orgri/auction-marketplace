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
import { LotCreateDto } from './dto/lot-create.dto';
import { LotUpdateDto } from './dto/lot-update.dto';
import { Lot, LotStatus } from './lot.entity';

@Injectable()
export class LotService {
  private readonly logger = new Logger(LotService.name);

  constructor(
    @InjectRepository(Lot)
    private readonly repo: Repository<Lot>,
    private readonly tasksService: TasksService,
  ) {}

  async createOne(ownerId: number, payload: LotCreateDto): Promise<Lot> {
    await this.validate(payload);

    payload['ownerId'] = ownerId;

    try {
      const lot = await this.repo.save(payload);
      this.tasksService.scheduleChangeStatus(lot.startAt, lot.id, lot.ownerId);
      return lot;
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
    let lot = await this.validateLot(ownerId, id, payload);

    try {
      lot = await this.repo.save(lot);
      this.tasksService.scheduleChangeStatus(lot.startAt, lot.id, lot.ownerId);
      return lot;
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException(['You are not able to update a lot']);
    }
  }

  async deleteOne(ownerId: number, id: number): Promise<DeleteResult> {
    await this.validateLot(ownerId, id);

    try {
      return await this.repo.delete({ id });
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException(['You are not able to delete a lot']);
    }
  }

  async getAll(page: number, limit: number): Promise<Lot[]> {
    const skip = limit * (page - 1);

    return await this.repo.find({
      where: { status: LotStatus.inProcess },
      skip: skip,
      take: limit,
    });
  }

  async getMy(ownerId: number, page: number, limit: number): Promise<Lot[]> {
    const skip = limit * (page - 1);

    return await this.repo.find({
      where: { ownerId },
      skip: skip,
      take: limit,
    });
  }

  async getByID(id: number): Promise<Lot> {
    return await this.repo.findOne({ id });
  }

  async validate(payload: LotCreateDto | LotUpdateDto): Promise<void> {
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

  async validateLot(ownerId: number, id: number, payload?: any): Promise<Lot> {
    const lot = this.repo.merge(await this.getByID(id), payload);

    if (!lot) {
      throw new NotFoundException();
    }

    if (ownerId != lot.ownerId) {
      throw new ForbiddenException();
    }

    const notAllowedStatuses = [LotStatus.inProcess, LotStatus.closed];

    if (notAllowedStatuses.includes(lot.status)) {
      throw new ValidationException([
        `You are not able to update/delete a lot in "${lot.status}" status`,
      ]);
    }

    await this.validate(lot);

    return lot;
  }
}
