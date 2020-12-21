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
import { Bid, User } from '../../../src/db/models';
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
    @Body() bid: BidCreateDto,
  ): Promise<Bid> {
    console.log(user, lotId, bid);
    return this.bidService.createOne(user.id, lotId, bid);
  }

  @Get('')
  async getAllBids(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: QueryDto,
  ): Promise<any> {
    console.log(id, query);
    return this.bidService.getAll(user.id, id, query.page, query.limit);
  }
}
