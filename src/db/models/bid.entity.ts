import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { decimalTransformer } from '../../../src/common/transformers';
import { Lot } from '.';

@Entity({ name: 'bids' })
export class Bid extends Base {
  @Column()
  ownerId: number;

  @Column()
  lotId: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  proposedPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  currentPrice: number;

  @ManyToOne(() => Lot, (lot) => lot.bids)
  lot: Lot;
}
