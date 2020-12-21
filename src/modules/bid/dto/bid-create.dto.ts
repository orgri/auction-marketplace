import { IsNotEmpty, IsPositive } from 'class-validator';

export class BidCreateDto {
  @IsNotEmpty()
  @IsPositive()
  proposedPrice: number;

  constructor(partial: Partial<BidCreateDto>) {
    Object.assign(this, partial);
  }
}
