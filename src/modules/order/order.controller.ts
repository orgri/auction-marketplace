import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { Order, User } from '../../db/models';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../user/user.decorator';
import {
  OrderCreateDto,
  OrderDto,
  OrderChangeStatusDto,
  OrderUpdateDto,
} from './dto';
import { OrderService } from './order.service';

@UseGuards(JwtAuthGuard)
@Controller('/lots/:id/order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('create')
  async createOrder(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) lotId: number,
    @Body() body: OrderCreateDto,
  ): Promise<Order> {
    return this.orderService.createOne(user.id, lotId, body);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('update')
  async updateOrder(
    @GetUser() user: User,
    @Body() body: OrderUpdateDto,
  ): Promise<OrderDto> {
    return new OrderDto(await this.orderService.updateOne(user.id, body));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('change-status')
  async changeStatusOrder(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) lotId: number,
    @Body() body: OrderChangeStatusDto,
  ): Promise<OrderDto> {
    return new OrderDto(
      await this.orderService.changeStatus(user.id, lotId, body),
    );
  }

  @Delete('delete')
  async deleteOrder(
    @GetUser() user: User,
    @Body() body: OrderUpdateDto,
  ): Promise<DeleteResult> {
    return this.orderService.deleteOne(user.id, body);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('')
  async getOrder(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrderDto> {
    return new OrderDto(await this.orderService.getOne(user.id, id));
  }
}
