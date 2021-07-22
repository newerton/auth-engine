import { Catch, RpcExceptionFilter, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'joi';
import { Observable, throwError } from 'rxjs';
import { JoiValidationException } from 'src/app.exceptions';

@Catch(JoiValidationException)
export class JoiValidationExceptionFilter
  implements RpcExceptionFilter<JoiValidationException>
{
  catch(exception: JoiValidationException): Observable<any> {
    const error = exception.getError() as ValidationError;
    const response = {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      error: 'Unprocessable Entity',
      message: exception.message,
      details: error?.details,
    };

    return throwError(() => JSON.stringify(response));
  }
}
