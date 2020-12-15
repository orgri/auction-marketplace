import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../models';
import { UserCreateDto } from './dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async getByEmail(email: string): Promise<User> {
    return this.repo.findOne({ email: email.toLowerCase() });
  }

  async getByID(id: number): Promise<User> {
    return this.repo.findOne({ id });
  }

  async createOne(user: UserCreateDto): Promise<User> {
    return this.repo.save(user);
  }

  async getAll(): Promise<User[]> {
    return this.repo.find();
  }
}
