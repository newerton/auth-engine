import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';
import { Headers } from 'src/types/headers.types';

import { AuthCredentialsUseCase } from '../../auth.credentials.use-case';

@Injectable()
export class AuthAdminUserCreateProviderUseCase {
  constructor(
    private authCredentialUseCase: AuthCredentialsUseCase,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  baseInternalUrl = this.configService.get<string>('keycloak.baseInternalUrl');
  realm = this.configService.get<string>('keycloak.realm');
  url = `${this.baseInternalUrl}/admin/realms/${this.realm}/users`;
  options = {
    headers: {} as Headers,
  };

  async execute({ id, identityProvider, userId, userName }): Promise<void> {
    const { access_token } = await this.authCredentialUseCase.execute();

    if (id && access_token) {
      this.options.headers.authorization = `Bearer ${access_token}`;
      const url = `${this.url}/${id}/federated-identity/${identityProvider}`;
      const payload = { identityProvider, userId, userName };
      return await lastValueFrom(
        this.httpService.post(url, payload, this.options),
      )
        .then(async (res) => res.data)
        .catch((e) => {
          const errorResponse = e.response;
          if (errorResponse.status === 409) {
            throw Exception.new({
              code: Code.CONFLICT,
              overrideMessage: errorResponse.data.errorMessage,
            });
          }
          throw Exception.new({
            code: Code.BAD_REQUEST,
            overrideMessage: e.response.data,
          });
        });
    }

    throw Exception.new({
      code: Code.BAD_REQUEST,
      overrideMessage: 'Access token invalid',
    });
  }
}
