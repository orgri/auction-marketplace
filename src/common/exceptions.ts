import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(message: any[], object?: any) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message,
        error: 'Validation Error',
        object,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
