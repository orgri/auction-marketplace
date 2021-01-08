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
  UseGuards,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../user/user.decorator';
import { User, Lot } from '../../db/models';
import { LotService } from './lot.service';
import { LotCreateDto, QueryDto, LotUpdateDto, LotFilterDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('lots')
export class LotController {
  constructor(private lotService: LotService) {}

  @Get('all')
  async getAllLots(@Query() query: QueryDto): Promise<Lot[]> {
    return this.lotService.getAll(query.page, query.limit);
  }

  @Get('my')
  async getMyLots(
    @GetUser() user: User,
    @Query() query: QueryDto,
    @Body() body: LotFilterDto,
  ): Promise<Lot[]> {
    return this.lotService.getMy(user.id, query, body);
  }

  @Post('create')
  async createLot(
    @GetUser() user: User,
    @Body() body: LotCreateDto,
  ): Promise<Lot> {
    return this.lotService.createOne(user.id, body);
  }

  @Patch(':id/update')
  async updateLot(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: LotUpdateDto,
  ): Promise<Lot> {
    return this.lotService.updateOne(user.id, id, body);
  }

  @Delete(':id/delete')
  async deleteLot(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteResult> {
    return this.lotService.deleteOne(user.id, id);
  }
}
