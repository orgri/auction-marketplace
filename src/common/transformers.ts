import { ValueTransformer } from 'typeorm';

export const decimalTransformer: ValueTransformer = {
  to: (entityValue: number) => entityValue,
  from: (databaseValue: string): number => parseFloat(databaseValue),
};
