import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  MaxLength,
} from 'class-validator';

import { Lot } from '../../../db/models';

export class LotCreateDto {
  @IsNotEmpty()
  @MaxLength(Lot.TITLE_LENGTH)
  title: string;

  @IsOptional()
  image: string;

  @IsOptional()
  @MaxLength(Lot.DESCRIPTION_LENGTH)
  description: string;

  @IsNotEmpty()
  @IsPositive()
  currentPrice: number;

  @IsNotEmpty()
  @IsPositive()
  estimetedPrice: number;

  @IsNotEmpty()
  @IsDateString()
  startAt: string;

  @IsNotEmpty()
  @IsDateString()
  endAt: string;

  constructor(partial: Partial<LotCreateDto>) {
    Object.assign(this, partial);
  }
}
