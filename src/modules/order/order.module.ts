import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { forwardRef, Module } from '@nestjs/common';
import { Order } from '../../db/models';
import { LotModule } from '..';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), forwardRef(() => LotModule)],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
