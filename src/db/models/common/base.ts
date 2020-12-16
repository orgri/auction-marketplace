import { PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Expose } from 'class-transformer';

export abstract class Base {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;
}
