import {
  ArgumentsHost,
  Catch,
  HttpException,
  Logger,
  RpcExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import { TcpContext } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

import { CoreApiResponse } from '@core/@shared/domain/api/CoreApiResponse';
import { Code } from '@core/@shared/domain/error/Code';
import {
  DefaultExceptionResponse,
  Exception,
} from '@core/@shared/domain/exception/Exception';
import { ApiServerConfig } from '@core/@shared/infrastructure/config/env/api-server.config';

type ErrorParams = Error & DefaultExceptionResponse;

@Catch()
export class RemoteProcedureCallExceptionFilter implements RpcExceptionFilter {
  catch(error: ErrorParams, host: ArgumentsHost): Observable<void> {
    const tcpContext: TcpContext = host.switchToRpc().getContext();

    let errorResponse: CoreApiResponse<unknown> = CoreApiResponse.error(
      Code.INTERNAL_ERROR.code,
      Code.INTERNAL_ERROR.error,
      error.message,
    );

    errorResponse = this.handleJSONException(error, errorResponse);
    errorResponse = this.handleNestError(error, errorResponse);
    errorResponse = this.handleCoreException(error, errorResponse);

    if (ApiServerConfig.LOG_ENABLE && tcpContext) {
      const message: string =
        `Method: ${host.getType()}; ` +
        `Path: ${tcpContext.getPattern()}; ` +
        `Error: ${errorResponse.error}; ` +
        `Message: ${errorResponse.message}`;

      Logger.error(message);
    }

    return throwError(() => errorResponse);
  }

  private handleNestError(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (error instanceof HttpException) {
      errorResponse = CoreApiResponse.error(
        error.getStatus(),
        'HttpException',
        error.message,
      );
    }
    if (error instanceof UnauthorizedException) {
      errorResponse = CoreApiResponse.error(
        Code.UNAUTHORIZED.code,
        Code.UNAUTHORIZED.error,
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

  private handleJSONException(
    error: DefaultExceptionResponse,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (typeof error === 'object') {
      const code = typeof error.code === 'number' ? error.code : 500;
      errorResponse = CoreApiResponse.error(
        code,
        error.error,
        error.message,
        error.details ? error.details : [],
      );
    }

    return errorResponse;
  }
}
