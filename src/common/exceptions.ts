import { HttpException } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(message: any[], object?: any) {
    super({ statusCode: 422, message, error: 'Validation Error', object }, 422);
  }
}
