import { Exclude, Expose } from 'class-transformer';
import { ArrivalType, Bid, OrderStatus } from '../../../db/models';

export class OrderDto {
  @Expose()
  id: number;

  @Expose()
  bidId: number;

  @Expose()
  arrivalLocation: string;

  @Expose()
  arrivalType: ArrivalType;

  @Expose()
  status: OrderStatus;

  @Expose()
  createdAt: Date;

  @Exclude()
  bid: Bid;

  constructor(partial: Partial<OrderDto>) {
    Object.assign(this, partial);
  }
}
