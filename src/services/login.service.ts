import { Injectable } from '@nestjs/common';
import * as qs from 'qs';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from 'src/dto/login.dto';
import { Auth } from 'src/schemas/auth.schema';
import { UnauthorizedException } from 'src/app.exceptions';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class LoginService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  baseUrl = this.configService.get<string>('keycloak.baseUrl');
  realm = this.configService.get<string>('keycloak.realm');
  url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
  options = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  async execute({ email, password }: LoginDto): Promise<Auth> {
    const payload = qs.stringify({
      grant_type: 'password',
      client_id: this.configService.get<string>('keycloak.clientId'),
      client_secret: this.configService.get<string>('keycloak.secret'),
      scope: 'openid address',
      username: email,
      password: password,
    });
    return await lastValueFrom(
      this.httpService.post(this.url, payload, this.options),
    )
      .then((res) => res.data)
      .catch((e) => {
        throw new UnauthorizedException(e.response.data);
      });
  }
}
