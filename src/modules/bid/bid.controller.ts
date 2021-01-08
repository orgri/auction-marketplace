import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Bid, Lot, User } from '../../db/models';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QueryDto } from '../lot/dto';
import { GetUser } from '../user/user.decorator';
import { BidService } from './bid.service';
import { BidCreateDto } from './dto/bid-create.dto';

@UseGuards(JwtAuthGuard)
@Controller('/lots/:id/bids')
export class BidController {
  constructor(private bidService: BidService) {}

  @Post('create')
  async createBid(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) lotId: number,
    @Body() body: BidCreateDto,
  ): Promise<Bid> {
    return this.bidService.createOne(user.id, lotId, body);
  }

  @Get('')
  async getAllBids(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: QueryDto,
  ): Promise<Lot> {
    return this.bidService.getAll(user.id, id, query.page, query.limit);
  }
}
