import { IsEnum, IsInt, IsNotEmpty, MaxLength } from 'class-validator';
import { ArrivalType, Order } from '../../../db/models';

export class OrderCreateDto {
  @IsNotEmpty()
  @IsInt()
  bidId: number;

  @IsNotEmpty()
  @MaxLength(Order.LOCATION_LENGTH)
  arrivalLocation: string;

  @IsNotEmpty()
  @IsEnum(ArrivalType)
  arrivalType: ArrivalType;

  constructor(partial: Partial<OrderCreateDto>) {
    Object.assign(this, partial);
  }
}
