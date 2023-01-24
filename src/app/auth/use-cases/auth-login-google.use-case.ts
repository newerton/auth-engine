import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';
import { Auth } from 'src/schemas/auth.schema';
import { User } from 'src/types/user.type';

import { AuthAdminUserCreateProviderUseCase } from './admin/users/auth-admin-user-create-provider.use-case';
import { AuthAdminUserUpdateUseCase } from './admin/users/auth-admin-user-update.use-case';
import { AuthTokenExchangeUseCase } from './auth-token-exchange.use-case';
import { AuthCredentialsUseCase } from './auth.credentials.use-case';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginWithProvidersDto } from '../dto/login-with-providers.dto';
import { AuthGoogleProvider } from '../providers/Google/provider/auth-google.provider';

@Injectable()
export class AuthLoginGoogleUseCase {
  constructor(
    @Inject('USER_SERVICE') private readonly client: ClientProxy,
    private authGoogleProvider: AuthGoogleProvider,
    private authCredentialUseCase: AuthCredentialsUseCase,
    private authAdminUserUpdateUseCase: AuthAdminUserUpdateUseCase,
    private authAdminUserCreateProviderUseCase: AuthAdminUserCreateProviderUseCase,
    private authTokenExchangeUseCase: AuthTokenExchangeUseCase,
  ) {}

  /**
   * https://www.keycloak.org/docs/latest/server_admin/#retrieving-external-idp-tokens
   *
   * @param accessToken string
   * @param deviceToken string
   * @returns Auth
   */
  async execute({
    accessToken,
    deviceToken,
  }: LoginWithProvidersDto): Promise<Auth> {
    const { access_token } = await this.authCredentialUseCase.execute();

    if (access_token) {
      const {
        id: googleId,
        given_name: googleFirstName,
        family_name: googleLastName,
        email: googleEmail,
      } = await this.authGoogleProvider.me(accessToken);

      const newEmail = googleEmail || `${googleId}@auth.google.com`;

      const user = await this.getUser(newEmail);

      if (user) {
        return await this.updateUser({
          user,
          accessToken,
          deviceToken,
          googleId,
          email: newEmail,
        });
      }

      if (!user) {
        return await this.createUser({
          googleId,
          firstName: googleFirstName,
          lastName: googleLastName,
          email: newEmail,
          deviceToken,
          accessToken,
        });
      }

      throw Exception.new({
        code: Code.BAD_REQUEST,
        overrideMessage: 'Não foi possível criar a autenticação do google',
      });
    }

    throw Exception.new({
      code: Code.BAD_REQUEST,
      overrideMessage: 'Access token invalid',
    });
  }

  async getUser(email) {
    try {
      const { id } = await lastValueFrom(
        this.client.send<User>('users.find_one', { email }),
      );
      if (id) {
        const user = await lastValueFrom(
          this.client.send<User>('users.find_by_id', { id }),
        );
        return user;
      }
    } catch (err) {
      return false;
    }
  }

  async createUser({
    googleId,
    firstName,
    lastName,
    email,
    deviceToken,
    accessToken,
  }) {
    try {
      const hash = (Math.random() + 1).toString(36);
      const payload: CreateUserDto = {
        firstName,
        lastName,
        email,
        passwordCurrent: hash,
        repeatPasswordCurrent: hash,
        emailVerified: true,
        deviceToken,
      };
      await lastValueFrom(
        this.client.send<User>('users.create', {
          payload,
        }),
      );

      const newUser = await this.getUser(email);
      if (newUser) {
        await this.authAdminUserCreateProviderUseCase.execute({
          id: newUser.id,
          identityProvider: 'google',
          userId: googleId,
          userName: email,
        });
      }

      return this.authTokenExchangeUseCase.execute({
        issuer: 'google',
        token: accessToken,
      });
    } catch (err) {
      console.log(err);
      throw Exception.new({
        code: Code.BAD_REQUEST,
        overrideMessage: 'Não foi possível criar o seu cadastro',
      });
    }
  }

  async updateUser({ user, accessToken, deviceToken, googleId, email }) {
    try {
      user.attributes['device_token'] = [deviceToken];
      await this.authAdminUserUpdateUseCase.execute(user);

      const clientAuth = user.federatedIdentities.filter(
        (provider) => provider.identityProvider === 'google',
      );

      if (clientAuth.length === 0) {
        await this.authAdminUserCreateProviderUseCase.execute({
          id: user.id,
          identityProvider: 'google',
          userId: googleId,
          userName: email,
        });
      }

      return this.authTokenExchangeUseCase.execute({
        issuer: 'google',
        token: accessToken,
      });
    } catch (err) {
      throw Exception.new({
        code: Code.BAD_REQUEST,
        overrideMessage: err,
      });
    }
  }
}
