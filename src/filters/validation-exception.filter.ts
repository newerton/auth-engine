import { Catch, RpcExceptionFilter, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

@Catch()
export class ValidationExceptionFilter implements RpcExceptionFilter {
  catch(exception: any): Observable<any> {
    const error = {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      error: ValidationExceptionFilter.name,
      message: exception.message,
      details: [
        {
          filter: ValidationExceptionFilter.name,
          exception: exception.constructor.name,
          ...exception,
        },
      ],
    };

    return throwError(JSON.stringify(error));
  }
}
