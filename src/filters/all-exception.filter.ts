// import { Catch, RpcExceptionFilter, HttpStatus } from '@nestjs/common';
// import { Observable, throwError } from 'rxjs';
// import { AxiosError } from 'axios';
// import { AppException } from 'src/app.exceptions';
// import { AppExceptionFilter } from './app-exception.filter';

// type ErrorProps = {
//   statusCode: number;
//   error: string;
//   message: string;
//   details: Array<{ [key: string]: any }>;
// };

// @Catch()
// export class AllExceptionFilter implements RpcExceptionFilter {
//   catch(exception: any): Observable<any> {
//     let error: ErrorProps = {
//       statusCode: HttpStatus.BAD_REQUEST,
//       error: 'Bad Request',
//       message: 'Bad Request',
//       details: [
//         {
//           message: 'No identificate the error',
//         },
//       ] as any,
//     };

//     if (exception instanceof AppException) {
//       return new AppExceptionFilter().catch(exception);
//     } else if (exception.isAxiosError) {
//       const e: AxiosError = exception;
//       error = {
//         statusCode: e.response.status,
//         error: 'AxiosError',
//         message: e.response.statusText,
//         details: [
//           {
//             filter: AllExceptionFilter.name,
//             exception: exception.constructor.name,
//             ...e,
//           },
//         ],
//       };
//     } else if (!this.hasJsonStructure(exception)) {
//       error = {
//         statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
//         error: AllExceptionFilter.name,
//         message: exception.message,
//         details: [
//           {
//             filter: AllExceptionFilter.name,
//             exception: exception.constructor.name,
//             ...exception,
//           },
//         ],
//       };
//     } else {
//       error = JSON.parse(exception);
//     }

//     return throwError(() => JSON.stringify(error));
//   }

//   hasJsonStructure(str: any) {
//     if (typeof str !== 'string') return false;
//     try {
//       const result = JSON.parse(str);
//       const type = Object.prototype.toString.call(result);
//       return type === '[object Object]' || type === '[object Array]';
//     } catch (err) {
//       return false;
//     }
//   }
// }
