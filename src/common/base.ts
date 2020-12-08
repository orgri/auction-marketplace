import { PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Expose } from 'class-transformer';

export abstract class Base {
  constructor(partial: Partial<Base>) {
    Object.assign(this, partial);
  }

  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;
}
