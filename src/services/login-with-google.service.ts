import { Inject, Injectable } from '@nestjs/common';
import { BadRequestException } from 'src/app.exceptions';
import { lastValueFrom } from 'rxjs';
import { LoginWithProvidersDto } from 'src/dto/login-with-providers.dto';
import { GoogleProvider } from 'src/providers/Google/provider/google.provider';
import { ClientProxy } from '@nestjs/microservices';
import { CredentialsService } from './credentials.service';
import { User } from 'src/types/user.type';
import { AdminUserUpdateService } from './admin/users/user-update.service';
import { AdminUserCreateProviderService } from './admin/users/user-create-provider.service';
import { TokenExchangeService } from './token-exchange.service';
import { Auth } from 'src/schemas/auth.schema';
import { CreateUserDto } from 'src/dto/create-user.dto';

@Injectable()
export class LoginWithGoogleService {
  constructor(
    @Inject('USER_SERVICE') private readonly client: ClientProxy,
    private googleProvider: GoogleProvider,
    private credentialService: CredentialsService,
    private adminUserUpdateService: AdminUserUpdateService,
    private adminUserCreateProviderService: AdminUserCreateProviderService,
    private tokenExchangeService: TokenExchangeService,
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
    const { access_token } = await this.credentialService.execute();

    if (access_token) {
      const {
        id: googleId,
        given_name: googleFirstName,
        family_name: googleLastName,
        email: googleEmail,
      } = await this.googleProvider.me(accessToken);

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

      throw new BadRequestException(
        'Não foi possível criar a autenticação do google',
      );
    }

    throw new BadRequestException('Access token invalid');
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
        await this.adminUserCreateProviderService.execute({
          id: newUser.id,
          identityProvider: 'google',
          userId: googleId,
          userName: email,
        });
      }

      return this.tokenExchangeService.execute({
        issuer: 'google',
        token: accessToken,
      });
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Não foi possível criar o seu cadastro');
    }
  }

  async updateUser({ user, accessToken, deviceToken, googleId, email }) {
    try {
      user.attributes['device_token'] = [deviceToken];
      await this.adminUserUpdateService.execute(user);

      const clientAuth = user.federatedIdentities.filter(
        (provider) => provider.identityProvider === 'google',
      );

      if (clientAuth.length === 0) {
        await this.adminUserCreateProviderService.execute({
          id: user.id,
          identityProvider: 'google',
          userId: googleId,
          userName: email,
        });
      }

      return this.tokenExchangeService.execute({
        issuer: 'google',
        token: accessToken,
      });
    } catch (err) {
      throw new BadRequestException(err);
    }
  }
}
