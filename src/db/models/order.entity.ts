import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Bid } from '.';

export enum OrderStatus {
  pending = 'pending',
  sent = 'sent',
  delivered = 'delivered',
}

export enum ArrivalType {
  pickup = 'pickup',
  royalMail = 'Royal Mail',
  usPostal = 'United States Postal Service',
  dhl = 'DHL Express',
}

@Entity({ name: 'orders' })
export class Order extends Base {
  static readonly LOCATION_LENGTH = 1000;

  @Column({ unique: true })
  bidId: number;

  @Column()
  arrivalLocation: string;

  @Column('simple-enum', { enum: ArrivalType })
  arrivalType: ArrivalType;

  @Column('simple-enum', { enum: OrderStatus, default: OrderStatus.pending })
  status: OrderStatus;

  @OneToOne(() => Bid, (bid) => bid.order)
  @JoinColumn()
  bid: Bid;
}
