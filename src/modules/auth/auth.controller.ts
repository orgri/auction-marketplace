import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  Post,
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
import { User } from '../../db/models';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async signup(@Body() body: UserCreateDto): Promise<UserDto> {
    return new UserDto(await this.authService.signup(body));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: AuthPayloadDto): Promise<AuthResponseDto> {
    return new AuthResponseDto(await this.authService.login(body));
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() user: ForgotPasswordDto): Promise<unknown> {
    return this.authService.forgotPassword(user);
  }

  // @Get('change-password')
  // async verifyChange(@Query('token') token: string): Promise<any> {
  //   return this.authService.verifyToken(token);
  // }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('change-password')
  @HttpCode(200)
  async changePassword(
    @GetUser() user: User,
    @Body() body: ChangePasswordDto,
  ): Promise<AuthResponseDto> {
    return new AuthResponseDto(
      await this.authService.changePassword(user.email, body),
    );
  }
}
