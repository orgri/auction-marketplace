import { IsOptional, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

const PAGE_DEFAULT = 1;
const LIMIT_DEFAULT = 10;

export class QueryDto {
  @IsOptional()
  @Transform((page) => parseInt(page, 10), {
    toClassOnly: true,
  })
  @IsPositive()
  page = PAGE_DEFAULT;

  @IsOptional()
  @Transform((limit) => parseInt(limit, 10), {
    toClassOnly: true,
  })
  @IsPositive()
  limit = LIMIT_DEFAULT;

  constructor(partial: Partial<QueryDto>) {
    Object.assign(this, partial);
  }
}
