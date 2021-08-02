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
export class BadRequestException extends AppException {
  constructor(message: { [key: string]: string }) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message: 'Bad Request',
      details: [message],
    });
  }
}

export class NotFoundException extends AppException {
  constructor() {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      error: 'Not Found',
      message: 'Dados inválido.',
      details: [],
    });
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: { [key: string]: string }) {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'Unauthorized',
      message: 'Dados inválido.',
      details: [message],
    });
  }
}

export class ConflictException extends AppException {
  constructor(message: Array<string>) {
    super({
      statusCode: HttpStatus.CONFLICT,
      error: 'Conflict',
      message: message,
      details: [],
    });
  }
}

export class JoiValidationException extends AppException {
  constructor(err: ValidationType) {
    super({
      ...err,
    });
  }
}
