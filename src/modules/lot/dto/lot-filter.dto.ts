import { IsBoolean, IsOptional } from 'class-validator';

const IS_OWNED_DEFAULT = true;
const IS_PARTICIPATED_DEFAULT = true;

export class LotFilterDto {
  @IsOptional()
  @IsBoolean()
  isOwned = IS_OWNED_DEFAULT;

  @IsOptional()
  @IsBoolean()
  isParticipated = IS_PARTICIPATED_DEFAULT;

  constructor(partial: Partial<LotFilterDto>) {
    Object.assign(this, partial);
  }
}
