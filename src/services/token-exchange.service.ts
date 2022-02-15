import * as qs from 'qs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, ConflictException } from 'src/app.exceptions';
import { Auth } from 'src/schemas/auth.schema';

@Injectable()
export class TokenExchangeService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  baseInternalUrl = this.configService.get<string>('keycloak.baseInternalUrl');
  realm = this.configService.get<string>('keycloak.realm');
  url = `${this.baseInternalUrl}/realms/${this.realm}/protocol/openid-connect/token`;
  options = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  async execute({ issuer, token }): Promise<Auth> {
    const payload = qs.stringify({
      client_id: this.configService.get<string>(
        'keycloak.user_credentials.clientId',
      ),
      client_secret: this.configService.get<string>(
        'keycloak.user_credentials.secret',
      ),
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      subject_token: token,
      subject_issuer: issuer,
    });

    return await lastValueFrom(
      this.httpService.post(this.url, payload, this.options),
    )
      .then(async (res) => res.data)
      .catch((e) => {
        const errorResponse = e.response;
        if (errorResponse.status === 409) {
          throw new ConflictException(errorResponse.data.errorMessage);
        }
        throw new BadRequestException(e.response?.data || e.message);
      });
  }
}
