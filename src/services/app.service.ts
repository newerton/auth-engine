import { HttpService, Injectable } from '@nestjs/common';
import * as qs from 'qs';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from 'src/dto/login.dto';
import { Auth } from 'src/schemas/auth.schema';
import { UnauthorizedException } from 'src/app.exceptions';

@Injectable()
export class AppService {
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

  async login({ email, password }: LoginDto): Promise<Auth> {
    let response: { data: Auth };
    const payload = qs.stringify({
      grant_type: 'password',
      client_id: this.configService.get<string>('keycloak.clientId'),
      client_secret: this.configService.get<string>('keycloak.secret'),
      scope: 'openid email profile',
      username: email,
      password: password,
    });
    try {
      response = await this.httpService
        .post(this.url, payload, this.headers)
        .toPromise();
    } catch (e) {
      throw new UnauthorizedException();
    }

    return response.data;
  }

  async credentials(): Promise<Auth> {
    console.log(this.url);
    let response: { data: Auth };
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

    try {
      response = await this.httpService
        .post(this.url, payload, this.headers)
        .toPromise();
    } catch (e) {
      throw new UnauthorizedException();
    }

    return response.data;
  }
}
