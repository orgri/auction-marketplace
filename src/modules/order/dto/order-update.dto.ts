import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ArrivalType, Order } from '../../../db/models';

export class OrderUpdateDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsOptional()
  @MaxLength(Order.LOCATION_LENGTH)
  arrivalLocation: string;

  @IsOptional()
  @IsEnum(ArrivalType)
  arrivalType: ArrivalType;

  constructor(partial: Partial<OrderUpdateDto>) {
    Object.assign(this, partial);
  }
}
