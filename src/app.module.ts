import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { AppController } from './app.controller';
import { JoiValidationExceptionFilter } from './filters/joi.validation-exception.filter';
import { AppExceptionFilter } from './filters/app-exception.filter';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';
import configuration from './config/configuration';
import { HttpModule } from '@nestjs/axios';
import { AppService } from './app.service';
import { CredentialsService } from './services/credentials.service';
import { LoginService } from './services/login.service';
import { LoginWithFacebookService } from './services/login-with-facebook.service';
import { FacebookProvider } from './providers/Facebook/provider/facebook.provider';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AdminUserUpdateService } from './services/admin/users/user-update.service';
import { AdminUserCreateProviderService } from './services/admin/users/user-create-provider.service';
import { TokenExchangeService } from './services/token-exchange.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3002,
        },
      },
    ]),
    KeycloakConnectModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        debug: config.get<string>('keycloak.debug'),
        authServerUrl: config.get<string>('keycloak.baseUrl'),
        realm: config.get<string>('keycloak.realm'),
        clientId: config.get<string>('keycloak.clientId'),
        secret: config.get<string>('keycloak.secret'),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AdminUserUpdateService,
    AdminUserCreateProviderService,
    CredentialsService,
    LoginService,
    LoginWithFacebookService,
    FacebookProvider,
    TokenExchangeService,
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter,
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: ValidationExceptionFilter,
    // },
    {
      provide: APP_FILTER,
      useClass: JoiValidationExceptionFilter,
    },
  ],
})
export class AppModule {}
