import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import * as qs from 'qs';
import { lastValueFrom } from 'rxjs';

import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';
import { Auth } from 'src/schemas/auth.schema';
import { User } from 'src/types/user.type';

import { AuthAdminUserUpdateUseCase } from './admin/users/auth-admin-user-update.use-case';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthLoginUseCase {
  constructor(
    @Inject('USER_SERVICE') private readonly client: ClientProxy,
    private httpService: HttpService,
    private configService: ConfigService,
    private authAdminUserUpdateUseCase: AuthAdminUserUpdateUseCase,
  ) {}

  baseInternalUrl = this.configService.get<string>('keycloak.baseInternalUrl');
  realm = this.configService.get<string>('keycloak.realm');
  url = `${this.baseInternalUrl}/realms/${this.realm}/protocol/openid-connect/token`;
  options = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  async execute({ email, password, deviceToken }: LoginDto): Promise<Auth> {
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
      .then((res) => {
        this.updateUser(email, deviceToken);
        return res.data;
      })
      .catch((e) => {
        throw Exception.new({
          code: Code.UNAUTHORIZED,
          overrideMessage: e.response?.data?.error_description || e.message,
          data: e.response?.data,
        });
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

  async updateUser(email, deviceToken) {
    const user = await this.getUser(email);
    if (user) {
      user.attributes['device_token'] = [deviceToken];
      await this.authAdminUserUpdateUseCase.execute(user);
    }
  }
}
