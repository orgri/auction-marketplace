import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '../../db/models';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserUpdateDto } from './dto';
import { GetUser } from './user.decorator';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // @UseInterceptors(ClassSerializerInterceptor)
  // @Get()
  // async getAll(): Promise<User[]> {
  //   return this.userService.getAll();
  // }

  // @UseInterceptors(ClassSerializerInterceptor)
  // @Get('profile/:id')
  // async getOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
  //   return this.userService.getByID(id);
  // }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateOne(
    @GetUser() user: User,
    @Body() body: UserUpdateDto,
  ): Promise<User> {
    return this.userService.updateById(user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('profile')
  async getProfile(@GetUser() user: User): Promise<User> {
    return this.userService.getByID(user.id);
  }
}
