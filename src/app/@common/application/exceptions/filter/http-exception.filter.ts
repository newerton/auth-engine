import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { CoreApiResponse } from '@core/@shared/domain/api/CoreApiResponse';
import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';
import { ApiServerConfig } from '@core/@shared/infrastructure/config/env/api-server.config';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost): void {
    const request: Request = host.switchToHttp().getRequest();
    const response: Response = host.switchToHttp().getResponse<Response>();
    let errorResponse: CoreApiResponse<unknown> = CoreApiResponse.error(
      Code.INTERNAL_ERROR.code,
      error.message,
    );

    errorResponse = this.handleNestError(error, errorResponse);
    errorResponse = this.handleCoreException(error, errorResponse);

    if (ApiServerConfig.LOG_ENABLE && request) {
      const message: string =
        `Method: ${request.method}; ` +
        `Path: ${request.path}; ` +
        `Error: ${errorResponse.error}; ` +
        `Message: ${errorResponse.message}`;

      Logger.error(message);
    }

    const status = errorResponse.code > 999 ? 400 : errorResponse.code;
    response.status(status).json(errorResponse);
  }

  private handleNestError(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (error instanceof HttpException) {
      errorResponse = CoreApiResponse.error(
        error.getStatus(),
        error.message,
        null,
      );
    }
    if (error instanceof UnauthorizedException) {
      errorResponse = CoreApiResponse.error(
        Code.UNAUTHORIZED.code,
        Code.UNAUTHORIZED.message,
        null,
      );
    }

    return errorResponse;
  }

  private handleCoreException(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (error instanceof Exception) {
      errorResponse = CoreApiResponse.error(
        error.code,
        error.error,
        error.message,
        error.data ? [error.data] : [],
      );
    }

    return errorResponse;
  }
}
