import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '../../common/exceptions';
import { isAdult } from '../../common/validations';
import { Repository } from 'typeorm';
import { User } from '../../db/models';
import { UserCreateDto, UserUpdateDto } from './dto';

const ADULT_YEARS = 21;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async getByEmail(email: string): Promise<User> {
    return this.repo.findOne(
      { email },
      {
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'phone',
          'birth',
          'password',
        ],
      },
    );
  }

  async getByID(id: number): Promise<User> {
    return this.repo.findOne({ id });
  }

  async createOne(body: UserCreateDto): Promise<User> {
    return this.repo.save(this.repo.create(body));
  }

  async updatePassword(email: string, password: string): Promise<User> {
    const user = await this.getByEmail(email);
    this.repo.merge(user, { password });
    return this.repo.save(user);
  }

  async updateById(id: number, body: UserUpdateDto): Promise<User> {
    const user = await this.getByID(id);
    this.repo.merge(user, body);

    if (!isAdult(body.birth, ADULT_YEARS)) {
      throw new ValidationException([
        `You are must be ${ADULT_YEARS} years old`,
      ]);
    }

    try {
      return await this.repo.save(user);
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException(['You are not able to update user']);
    }
  }

  async getAll(): Promise<User[]> {
    return this.repo.find();
  }
}
