import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';
import { Headers } from 'src/types/headers.types';
import { User } from 'src/types/user.type';

import { AuthCredentialsUseCase } from '../../auth.credentials.use-case';

@Injectable()
export class AuthAdminUserUpdateUseCase {
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

  async execute(user: User): Promise<void> {
    const { access_token } = await this.authCredentialUseCase.execute();

    if (user.id && access_token) {
      this.options.headers.authorization = `Bearer ${access_token}`;
      const url = `${this.url}/${user.id}`;
      return await lastValueFrom(this.httpService.put(url, user, this.options))
        .then(async (res) => res.data)
        .catch((e) => {
          throw Exception.new({
            code: Code.UNAUTHORIZED,
            overrideMessage: e.response.data,
          });
        });
    }

    throw Exception.new({
      code: Code.UNAUTHORIZED,
      overrideMessage: 'Access token invalid',
    });
  }
}
