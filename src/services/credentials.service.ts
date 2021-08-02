import { Injectable } from '@nestjs/common';
import * as qs from 'qs';
import { ConfigService } from '@nestjs/config';
import { Auth } from 'src/schemas/auth.schema';
import { UnauthorizedException } from 'src/app.exceptions';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class CredentialsService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  baseUrl = this.configService.get<string>('keycloak.baseUrl');
  realm = this.configService.get<string>('keycloak.realm');
  url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
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
        throw new UnauthorizedException(e.response.data);
      });
  }
}
