import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserCreateDto } from './dto/user-create.dto';
import { isAdult } from '../../common/validations';
import { ValidationException } from '../../common/exceptions';
import * as bcrypt from 'bcrypt';

const ADULT_YEARS = 21;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async getByEmail(email: string): Promise<User> {
    return this.repo.findOne({ email: email.toLowerCase() });
  }

  async signup(payload: UserCreateDto): Promise<User> {
    if (!isAdult(payload.birth, ADULT_YEARS)) {
      throw new ValidationException([
        `You are must be ${ADULT_YEARS} years old`,
      ]);
    }

    payload.password = await bcrypt.hash(payload.password, 10);

    try {
      return new User(await this.repo.save(payload));
    } catch (error) {
      // TODO: add this to logger
      const logError = {
        message: error.message,
        detail: error.detail,
      };

      console.log(logError);
      throw new ValidationException(['You are not able to register']);
    }
  }
}
