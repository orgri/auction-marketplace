import { Entity, Column } from 'typeorm';
import { Base } from '../../common/base';

export enum LotStatus {
  pending = 'pending',
  inProcess = 'in_process',
  closed = 'closed',
}

@Entity({ name: 'lots' })
export class Lot extends Base {
  static readonly TITLE_LENGTH = 300;
  static readonly DESCRIPTION_LENGTH = 1000;

  @Column()
  ownerId: number;

  @Column({ length: Lot.TITLE_LENGTH })
  title: string;

  @Column({ nullable: true })
  image: string;

  @Column({ length: Lot.DESCRIPTION_LENGTH, nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  estimetedPrice: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column()
  startAt: string;

  @Column()
  endAt: string;

  @Column('simple-enum', { enum: LotStatus, default: LotStatus.pending })
  status: LotStatus;
}
