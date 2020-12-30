import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../db/models';
import { UserCreateDto, UserUpdateDto } from './dto';

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

  async createOne(payload: UserCreateDto): Promise<User> {
    return this.repo.save(this.repo.create(payload));
  }

  async updateOne(email: string, payload: UserUpdateDto): Promise<User> {
    const user = await this.getByEmail(email);
    this.repo.merge(user, payload);
    return this.repo.save(user);
  }

  async getAll(): Promise<User[]> {
    return this.repo.find();
  }
}
