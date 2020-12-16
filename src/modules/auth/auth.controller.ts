import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserCreateDto, UserDto } from '../user/dto';
import {
  AuthPayloadDto,
  AuthResponseDto,
  ChangePasswordDto,
  ForgotPasswordDto,
} from './dto';
import { GetUser } from '../user/user.decorator';
import { User } from 'src/db/models';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async signup(@Body() payload: UserCreateDto): Promise<UserDto> {
    return this.authService.signup(payload).then((user) => new UserDto(user));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  async login(@Body() payload: AuthPayloadDto): Promise<AuthResponseDto> {
    return this.authService
      .login(payload)
      .then((user) => new AuthResponseDto(user));
  }

  @Post('forgot-password')
  async forgotPassword(@Body() user: ForgotPasswordDto): Promise<any> {
    return this.authService.forgotPassword(user);
  }

  @Get('change-password')
  async verifyChange(@Query('token') token: string): Promise<any> {
    return this.authService.verifyToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('change-password')
  async changePassword(
    @GetUser() user: User,
    @Body() payload: ChangePasswordDto,
  ): Promise<AuthResponseDto> {
    return this.authService
      .changePassword(user.email, payload)
      .then((user) => new AuthResponseDto(user));
  }
}
