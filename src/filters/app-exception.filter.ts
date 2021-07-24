import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { AppException } from 'src/app.exceptions';

@Catch(AppException)
export class AppExceptionFilter implements RpcExceptionFilter<AppException> {
  catch(exception: AppException): Observable<any> {
    const error = exception.getError() as any;
    const json = error;
    return throwError(() => JSON.stringify(json));
  }
}
