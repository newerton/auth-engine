import { Catch, HttpStatus, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { AppException, JoiValidationException } from 'src/app.exceptions';

type ErrorProps = {
  statusCode: number;
  error: string;
  message: string;
  details: Array<{ [key: string]: any }>;
};

@Catch()
export class AppExceptionFilter implements RpcExceptionFilter {
  catch(exception: any): Observable<any> {
    const error = exception.getError() as ErrorProps;
    let json = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal Server Error',
      details: [],
    };

    if (
      exception instanceof AppException &&
      exception.constructor.name !== 'JoiValidationException'
    ) {
      json = error;
    } else if (exception instanceof JoiValidationException) {
      json.statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
      json.error = JoiValidationException.name;
      json.message = error.message;
      json.details = error.details;
    }

    return throwError(() => JSON.stringify(json));
  }
}
