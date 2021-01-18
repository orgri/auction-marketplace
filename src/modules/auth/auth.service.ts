import {
  BadRequestException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../db/models';
import { UserService } from '../user/user.service';
import { MailService } from '../mails/mail.service';
import { MailTemplate } from '../mails/mail-types';
import { isAdult } from '../../common/validations';
import { ValidationException } from '../../common/exceptions';
import { UserCreateDto } from '../user/dto';
import { AuthPayloadDto, ChangePasswordDto, ForgotPasswordDto } from './dto';
import * as bcrypt from 'bcrypt';

const ADULT_YEARS = 21;

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
    private readonly mailService: MailService,
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

    try {
      return await this.userService.createOne(payload);
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException(['You are not able to register']);
    }
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

  async forgotPassword(payload: ForgotPasswordDto): Promise<unknown> {
    const { email } = payload;

    const user = await this.userService.getByEmail(email);

    if (user) {
      const token = await this.getJwtToken(user);
      const forgotLink = `/auth/verify-change?token=${token}&email=${email}`;

      this.mailService.sendMail(MailTemplate.forgotPassword, {
        to: email,
        subject: 'Password reset request!',
        context: {
          name: user.firstName,
          forgotLink,
        },
      });
    }

    return {
      message: 'Check your email to change password',
    };
  }

  async changePassword(
    email: string,
    payload: ChangePasswordDto,
  ): Promise<IAuthResponse> {
    const { password, repeatPassword } = payload;

    if (password !== repeatPassword) {
      throw new BadRequestException('Incorrect repeatPassword');
    }

    try {
      const updatedUser = await this.userService.updatePassword(
        email,
        password,
      );

      return {
        accessToken: await this.getJwtToken(updatedUser),
        user: updatedUser,
      };
    } catch (error) {
      this.logger.error(error);
      throw new ValidationException(['You are not able to update user']);
    }
  }

  async verifyToken(token: string): Promise<void> {
    try {
      await this.jwtService.verify(token);
    } catch (error) {
      throw new UnprocessableEntityException('Malformed token');
    }
  }

  authError() {
    throw new UnprocessableEntityException('Wrong email or password');
  }
}
