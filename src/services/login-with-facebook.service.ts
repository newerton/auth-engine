import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from 'src/app.exceptions';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { LoginWithProvidersDto } from 'src/dto/login-with-providers.dto';
import { FacebookProvider } from 'src/providers/Facebook/provider/facebook.provider';
import { ClientProxy } from '@nestjs/microservices';
import { CredentialsService } from './credentials.service';
import { User } from 'src/types/user.type';
import { AdminUserUpdateService } from './admin/users/user-update.service';
import { AdminUserCreateProviderService } from './admin/users/user-create-provider.service';
import { TokenExchangeService } from './token-exchange.service';
import { Auth } from 'src/schemas/auth.schema';

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
   * @param param0
   * @returns
   */
  async execute({
    accessToken,
    deviceToken,
  }: LoginWithProvidersDto): Promise<Auth> {
    const { access_token } = await this.credentialService.execute();

    if (access_token) {
      const {
        id: idFacebook,
        first_name: firstNameFacebook,
        middle_name: middleNameFacebook,
        last_name: lastNameFacebook,
        email: emailFacebook,
      } = await this.facebookProvider.me(accessToken);

      const newEmail = emailFacebook || `${idFacebook}@auth.facebook.com`;

      const { id } = await lastValueFrom(
        this.client.send<User>('users.find_one', { email: newEmail }),
      );

      if (id) {
        const user = await lastValueFrom(
          this.client.send<User>('users.find_by_id', { id }),
        );

        if (user) {
          try {
            user.attributes['device_token'] = [deviceToken];
            await this.adminUserUpdateService.execute(user);

            const clientAuth = user.federatedIdentities.filter(
              (provider) => provider.identityProvider === 'facebook',
            );

            if (clientAuth.length === 0) {
              await lastValueFrom(
                this.client.send<User>('users.find_by_id', { id }),
              );
              await this.adminUserCreateProviderService.execute({
                id,
                identityProvider: 'facebook',
                userId: idFacebook,
                userName: newEmail,
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

        if (!user) {
          try {
            // const hashedPassword = await this.hashProvider.generateHash(
            //   `${process.env.APP_SECRET}facebook`,
            // );
            // const newClient = await this.clientRepository.create({
            //   name: firstNameFacebook,
            //   last_name: `${
            //     middleNameFacebook ? `${middleNameFacebook} ` : ''
            //   }${lastNameFacebook}`,
            //   email: newEmail,
            //   password: hashedPassword,
            //   visible: true,
            //   genre: 'u',
            // });
            // await this.clientAuthRepository.create({
            //   client_id: newClient.id,
            //   source: 'facebook',
            //   source_id: idFacebook,
            // });
            // if (device_token) {
            //   newClient.device_token = device_token;
            //   await this.clientRepository.save(newClient);
            // }
            // const { secret, expiresIn } = authConfig.jwt;
            // const token = sign({}, secret, {
            //   subject: newClient.id,
            //   expiresIn,
            // });
            // return { client: newClient, token };
          } catch (err) {
            console.log(err.response.data);
            throw new BadRequestException({
              error: 'Não foi possível criar o seu cadastro',
            });
          }
        }
      }

      throw new BadRequestException({
        error: 'Não foi possível criar a autenticação do facebook',
      });
    }

    throw new BadRequestException({
      error: '[LoginWithFacebookService] Access token invalid',
    });
  }
}
