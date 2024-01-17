import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as qs from 'qs';
import { lastValueFrom } from 'rxjs';

import { Auth } from '@app/@common/application/schemas';
import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';

@Injectable()
export class AuthCredentialsUseCase {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  baseInternalUrl = this.configService.get<string>('keycloak.baseInternalUrl');
  realm = this.configService.get<string>('keycloak.realm');
  url = `${this.baseInternalUrl}/realms/${this.realm}/protocol/openid-connect/token`;
  headers = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  async execute(): Promise<Auth> {
    const payload = qs.stringify({
      client_id: this.configService.get<string>(
        'keycloak.user_credentials.clientId',
      ),
      client_secret: this.configService.get<string>(
        'keycloak.user_credentials.secret',
      ),
      grant_type: this.configService.get<string>(
        'keycloak.user_credentials.grant_type',
      ),
    });

    return await lastValueFrom(
      this.httpService.post(this.url, payload, this.headers),
    )
      .then((res) => res.data)
      .catch((e) => {
        throw Exception.new({
          code: Code.UNAUTHORIZED.code,
          overrideMessage:
            e.response?.data?.error_description ||
            e.response?.data ||
            e.message,
          data: e.response?.data,
        });
      });
  }
}
