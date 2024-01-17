import { Module, Provider } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter';
import { HttpLoggingInterceptor } from '@app/@common/application/interceptors';
import { AuthModule } from '@app/auth/auth.module';
import { ApiServerConfig } from '@core/@shared/infrastructure/config/env';

const providers: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: RemoteProcedureCallExceptionFilter,
  },
];

if (ApiServerConfig.LOG_ENABLE) {
  providers.push({
    provide: APP_INTERCEPTOR,
    useClass: HttpLoggingInterceptor,
  });
}

@Module({
  imports: [AuthModule],
  providers,
})
export class MainModule {}
