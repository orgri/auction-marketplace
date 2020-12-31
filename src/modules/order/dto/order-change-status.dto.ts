import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../../../db/models';

export class OrderChangeStatusDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  constructor(partial: Partial<OrderChangeStatusDto>) {
    Object.assign(this, partial);
  }
}
