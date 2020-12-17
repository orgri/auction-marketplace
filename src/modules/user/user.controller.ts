import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '../../db/models';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getAll(): Promise<User[]> {
    return await this.userService.getAll();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.getByID(id);
  }
}
