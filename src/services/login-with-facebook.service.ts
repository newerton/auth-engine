import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from 'src/app.exceptions';
import { lastValueFrom } from 'rxjs';
import { LoginWithProvidersDto } from 'src/dto/login-with-providers.dto';
import { FacebookProvider } from 'src/providers/Facebook/provider/facebook.provider';
import { ClientProxy } from '@nestjs/microservices';
import { CredentialsService } from './credentials.service';
import { User } from 'src/types/user.type';
import { AdminUserUpdateService } from './admin/users/user-update.service';
import { AdminUserCreateProviderService } from './admin/users/user-create-provider.service';
import { TokenExchangeService } from './token-exchange.service';
import { Auth } from 'src/schemas/auth.schema';
import { CreateUserDto } from 'src/dto/create-user.dto';

@Injectable()
export class LoginWithFacebookService {
  constructor(
    @Inject('USER_SERVICE') private readonly client: ClientProxy,
    private configService: ConfigService,
    private facebookProvider: FacebookProvider,
    private credentialService: CredentialsService,
    private adminUserUpdateService: AdminUserUpdateService,
    private adminUserCreateProviderService: AdminUserCreateProviderService,
    private tokenExchangeService: TokenExchangeService,
  ) {}

  baseUrl = this.configService.get<string>('keycloak.baseUrl');
  realm = this.configService.get<string>('keycloak.realm');
  url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
  headers = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

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
    const { access_token } = await this.credentialService.execute();

    if (access_token) {
      const {
        id: facebookId,
        first_name: facebookFirstName,
        middle_name: facebookMiddleName,
        last_name: facebookLastName,
        email: facebookEmail,
      } = await this.facebookProvider.me(accessToken);

      const newEmail = facebookEmail || `${facebookId}@auth.facebook.com`;

      const user = await this.getUser(newEmail);

      if (user) {
        return await this.updateUser({
          user,
          accessToken,
          deviceToken,
          facebookId,
          email: newEmail,
        });
      }

      if (!user) {
        return await this.createUser({
          facebookId,
          firstName: facebookFirstName,
          lastName: `${
            facebookMiddleName ? `${facebookMiddleName} ` : ''
          }${facebookLastName}`,
          email: newEmail,
          deviceToken,
          accessToken,
        });
      }

      throw new BadRequestException({
        error: 'Não foi possível criar a autenticação do facebook',
      });
    }

    throw new BadRequestException({
      error: 'Access token invalid',
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
    facebookId,
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
        await this.adminUserCreateProviderService.execute({
          id: newUser.id,
          identityProvider: 'facebook',
          userId: facebookId,
          userName: email,
        });
      }

      return this.tokenExchangeService.execute({
        issuer: 'facebook',
        token: accessToken,
      });
    } catch (err) {
      console.log(err);
      throw new BadRequestException({
        error: 'Não foi possível criar o seu cadastro',
      });
    }
  }

  async updateUser({ user, accessToken, deviceToken, facebookId, email }) {
    try {
      user.attributes['device_token'] = [deviceToken];
      await this.adminUserUpdateService.execute(user);

      const clientAuth = user.federatedIdentities.filter(
        (provider) => provider.identityProvider === 'facebook',
      );

      if (clientAuth.length === 0) {
        await this.adminUserCreateProviderService.execute({
          id: user.id,
          identityProvider: 'facebook',
          userId: facebookId,
          userName: email,
        });
      }

      return this.tokenExchangeService.execute({
        issuer: 'facebook',
        token: accessToken,
      });
    } catch (err) {
      throw new BadRequestException({
        error: 'Não foi possível criar a autenticação do facebook',
      });
    }
  }
}
