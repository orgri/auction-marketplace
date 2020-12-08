import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UserCreateDto } from '../user/dto/user-create.dto';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { Public } from './auth.public.decorator';
import { AuthService } from './auth.service';
import { AuthPayloadDto } from './dto/auth-payload.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Public()
  @Post('signup')
  async signup(@Body() user: UserCreateDto): Promise<User> {
    return await this.userService.signup(user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Public()
  @Post('login')
  async login(@Body() user: AuthPayloadDto): Promise<AuthResponseDto> {
    return await this.authService.login(user);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() user: ForgotPasswordDto): Promise<any> {
    return await this.authService.forgotPassword(user);
  }

  @Public()
  @Get('change-password')
  async verifyChange(@Query('token') token: string): Promise<any> {
    return await this.authService.verifyToken(token);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('change-password')
  async changePassword(
    @Body() user: ChangePasswordDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.changePassword(user);
  }
}
