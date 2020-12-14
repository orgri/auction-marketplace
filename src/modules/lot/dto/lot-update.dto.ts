import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  MaxLength,
} from 'class-validator';

import { Lot } from '../lot.entity';

export class LotUpdateDto {
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(Lot.TITLE_LENGTH)
  title: string;

  @IsOptional()
  image: string;

  @IsOptional()
  @MaxLength(Lot.DESCRIPTION_LENGTH)
  description: string;

  @IsOptional()
  @IsPositive()
  currentPrice: number;

  @IsOptional()
  @IsPositive()
  estimetedPrice: number;

  @IsOptional()
  @IsDateString()
  startAt: string;

  @IsOptional()
  @IsDateString()
  endAt: string;
}
