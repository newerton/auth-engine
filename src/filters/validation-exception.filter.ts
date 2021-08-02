import { Catch, RpcExceptionFilter, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

@Catch()
export class ValidationExceptionFilter implements RpcExceptionFilter {
  catch(exception: any): Observable<any> {
    let error = JSON.parse(exception);
    if (!this.hasJsonStructure(exception)) {
      error = {
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
    }

    return throwError(() => JSON.stringify(error));
  }

  hasJsonStructure(str: any) {
    if (typeof str !== 'string') return false;
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]' || type === '[object Array]';
    } catch (err) {
      return false;
    }
  }
}
