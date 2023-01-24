import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KeycloakConnectModule } from 'nest-keycloak-connect';

import keycloakConfig from '@app/@common/infrastructure/config/keycloak.config';

import { AuthController } from './auth.controller';
import { AuthCredentialsController } from './controllers/auth-credentials.controller';
import { AuthLoginFacebookController } from './controllers/auth-login-facebook.controller';
import { AuthLoginGoogleController } from './controllers/auth-login-google.controller';
import { AuthLoginController } from './controllers/auth-login.controller';
import { AuthFacebookProvider } from './providers/Facebook/provider/auth-facebook.provider';
import { AuthGoogleProvider } from './providers/Google/provider/auth-google.provider';
import { AuthAdminUserCreateProviderUseCase } from './use-cases/admin/users/auth-admin-user-create-provider.use-case';
import { AuthAdminUserUpdateUseCase } from './use-cases/admin/users/auth-admin-user-update.use-case';
import { AuthLoginFacebookUseCase } from './use-cases/auth-login-facebook.use-case';
import { AuthLoginGoogleUseCase } from './use-cases/auth-login-google.use-case';
import { AuthLoginUseCase } from './use-cases/auth-login.use-case';
import { AuthTokenExchangeUseCase } from './use-cases/auth-token-exchange.use-case';
import { AuthCredentialsUseCase } from './use-cases/auth.credentials.use-case';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [keycloakConfig],
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '0.0.0.0',
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
  controllers: [
    AuthController,
    AuthCredentialsController,
    AuthLoginFacebookController,
    AuthLoginGoogleController,
    AuthLoginController,
  ],
  providers: [
    AuthAdminUserCreateProviderUseCase,
    AuthAdminUserUpdateUseCase,
    AuthCredentialsUseCase,
    AuthFacebookProvider,
    AuthGoogleProvider,
    AuthLoginFacebookUseCase,
    AuthLoginGoogleUseCase,
    AuthLoginUseCase,
    AuthTokenExchangeUseCase,
  ],
})
export class AuthModule {}
