import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { GetUser } from '../user/user.decorator';
import { User } from '../user/user.entity';
import { LotCreateDto } from './dto/lot-create.dto';
import { LotUpdateDto } from './dto/lot-update.dto';
import { LotQueryDto } from './dto/query.dto';
import { Lot } from './lot.entity';
import { LotService } from './lot.service';

@Controller('lots')
export class LotController {
  constructor(private lotService: LotService) {}

  @Get('all')
  async getAllLots(@Query() query: LotQueryDto): Promise<Lot[]> {
    return await this.lotService.getAll(query.page, query.limit);
  }

  @Get('my')
  async getMyLots(
    @GetUser() user: User,
    @Query() query: LotQueryDto,
  ): Promise<Lot[]> {
    return await this.lotService.getMy(user.id, query.page, query.limit);
  }

  @Post('create')
  async createLot(
    @GetUser() user: User,
    @Body() lot: LotCreateDto,
  ): Promise<Lot> {
    return await this.lotService.createOne(user.id, lot);
  }

  @Patch(':id/update')
  async updateLot(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() lot: LotUpdateDto,
  ): Promise<Lot> {
    return await this.lotService.updateOne(user.id, id, lot);
  }

  @Delete(':id/delete')
  async deleteLot(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteResult> {
    return await this.lotService.deleteOne(user.id, id);
  }
}
