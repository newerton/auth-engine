import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { AppException } from 'src/app.exceptions';

@Catch(AppException)
export class ExceptionFilter implements RpcExceptionFilter<AppException> {
  catch(exception: AppException): Observable<any> {
    const error = exception.getError() as any;
    const json = {
      ...error,
      details: [{ filter: ExceptionFilter.name, ...exception }],
    };
    return throwError(JSON.stringify(json));
  }
}
