import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthPayloadDto } from './dto/auth-payload.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { classToPlain } from 'class-transformer';
import * as bcrypt from 'bcrypt';

const APP_URL = '127.0.0.1:3000';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private getJwtToken(user: User): Promise<string> {
    const { email, id } = user;

    return this.jwtService.signAsync({ email, id });
  }

  async login(payload: AuthPayloadDto): Promise<AuthResponseDto> {
    const { email, password } = payload;
    const user = await this.userService.getByEmail(email);

    if (!user) {
      this.authError();
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      this.authError();
    }

    return {
      accessToken: await this.getJwtToken(user),
      user: classToPlain(user),
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

  async changePassword(payload: ChangePasswordDto): Promise<AuthResponseDto> {
    const { email, password, repeatPassword } = payload;

    if (password !== repeatPassword) {
      throw new UnprocessableEntityException('Incorrect repeatPassword');
    }

    const user = await this.userService.getByEmail(email);

    return {
      accessToken: await this.getJwtToken(user),
      user: classToPlain(user),
    };
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
