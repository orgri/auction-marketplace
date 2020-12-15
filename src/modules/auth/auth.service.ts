import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../models';
import { UserService } from '../user/user.service';
import { isAdult } from 'src/common/validations';
import { ValidationException } from 'src/common/exceptions';
import { UserCreateDto } from '../user/dto';
import { AuthPayloadDto, ChangePasswordDto, ForgotPasswordDto } from './dto';
import * as bcrypt from 'bcrypt';

const ADULT_YEARS = 21;
const APP_URL = '127.0.0.1:3000';

interface IAuthResponse {
  accessToken: string;
  user: User;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private getJwtToken(user: User): Promise<string> {
    const { email, id } = user;

    return this.jwtService.signAsync({ email, id });
  }

  async signup(payload: UserCreateDto): Promise<User> {
    if (!isAdult(payload.birth, ADULT_YEARS)) {
      throw new ValidationException([
        `You are must be ${ADULT_YEARS} years old`,
      ]);
    }

    const password = await bcrypt.hash(payload.password, 10);

    return this.userService
      .createOne({ ...payload, password })
      .catch((error) => {
        this.logger.error(error);
        throw new ValidationException(['You are not able to register']);
      });
  }

  async login(payload: AuthPayloadDto): Promise<IAuthResponse> {
    const { email, password } = payload;
    const user = await this.userService.getByEmail(email);

    if (!user) this.authError();

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) this.authError();

    return {
      accessToken: await this.getJwtToken(user),
      user: user,
    };
  }

  async forgotPassword(payload: ForgotPasswordDto): Promise<any> {
    const { email } = payload;

    const user = await this.userService.getByEmail(email);

    if (user) {
      const token = await this.getJwtToken(user);
      const forgotLink = `${APP_URL}/auth/verify-change?token=${token}&email=${email}`;
    }

    return {
      message: 'Check your email to change password',
    };
  }

  async changePassword(payload: ChangePasswordDto): Promise<IAuthResponse> {
    const { email, password, repeatPassword } = payload;

    if (password !== repeatPassword) {
      throw new UnprocessableEntityException('Incorrect repeatPassword');
    }

    const user = await this.userService.getByEmail(email);

    return {
      accessToken: await this.getJwtToken(user),
      user: user,
    };
  }

  async verifyToken(token: string): Promise<void> {
    this.jwtService.verify(token).catch(() => {
      throw new UnprocessableEntityException('Malformed token');
    });
  }

  authError() {
    throw new UnprocessableEntityException('Wrong email or password');
  }
}
