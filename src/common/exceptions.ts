import { HttpException } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(errors: any[], object?: any) {
    super({ name: 'Validation Error', errors, object }, 422);
  }
}
