import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

type ValidationType = {
  message: string;
  details: any;
};

export class AppException extends RpcException {}

/**
 * Doc: https://cloud.google.com/apis/design/errors#handling_errors
 */
export class NotFoundException extends AppException {
  constructor() {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      error: 'Not Found',
      message: 'Dados inválido.',
    });
  }
}

export class UnauthorizedException extends AppException {
  constructor() {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'Unauthorized',
      message: 'Dados inválido.',
    });
  }
}

export class JoiValidationException extends AppException {
  constructor(err: ValidationType) {
    super({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      error: 'Unprocessable Entity',
      ...err,
    });
  }
}
