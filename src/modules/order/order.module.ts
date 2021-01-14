import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { forwardRef, Module } from '@nestjs/common';
import { Order } from '../../db/models';
import { LotModule } from '../lot/lot.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from '../tasks/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => LotModule),
    QueueModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
