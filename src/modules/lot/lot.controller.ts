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
import { User, Lot } from '../../models';
import { LotService } from './lot.service';
import { LotCreateDto, LotQueryDto, LotUpdateDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('lots')
export class LotController {
  constructor(private lotService: LotService) {}

  @Get('all')
  async getAllLots(@Query() query: LotQueryDto): Promise<Lot[]> {
    return this.lotService.getAll(query.page, query.limit);
  }

  @Get('my')
  async getMyLots(
    @GetUser() user: User,
    @Query() query: LotQueryDto,
  ): Promise<Lot[]> {
    return this.lotService.getMy(user.id, query.page, query.limit);
  }

  @Post('create')
  async createLot(
    @GetUser() user: User,
    @Body() lot: LotCreateDto,
  ): Promise<Lot> {
    return this.lotService.createOne(user.id, lot);
  }

  @Patch(':id/update')
  async updateLot(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() lot: LotUpdateDto,
  ): Promise<Lot> {
    return this.lotService.updateOne(user.id, id, lot);
  }

  @Delete(':id/delete')
  async deleteLot(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteResult> {
    return this.lotService.deleteOne(user.id, id);
  }
}
