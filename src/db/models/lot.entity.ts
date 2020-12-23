import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { decimalTransformer } from '../../../src/common/transformers';
import { Bid } from '.';

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

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  currentPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  estimetedPrice: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column()
  startAt: string;

  @Column()
  endAt: string;

  @Column('simple-enum', { enum: LotStatus, default: LotStatus.pending })
  status: LotStatus;

  @OneToMany(() => Bid, (bid) => bid.lot)
  bids: Bid[];
}
