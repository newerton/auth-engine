import { Inject, Injectable } from '@nestjs/common';
import * as qs from 'qs';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from 'src/dto/login.dto';
import { Auth } from 'src/schemas/auth.schema';
import { UnauthorizedException } from 'src/app.exceptions';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { User } from 'src/types/user.type';
import { ClientProxy } from '@nestjs/microservices';
import { AdminUserUpdateService } from './admin/users/user-update.service';

@Injectable()
export class LoginService {
  constructor(
    @Inject('USER_SERVICE') private readonly client: ClientProxy,
    private httpService: HttpService,
    private configService: ConfigService,
    private adminUserUpdateService: AdminUserUpdateService,
  ) {}

  baseUrl = this.configService.get<string>('keycloak.baseUrl');
  realm = this.configService.get<string>('keycloak.realm');
  url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
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
    // console.log({
    //   grant_type: 'password',
    //   client_id: this.configService.get<string>('keycloak.clientId'),
    //   client_secret: this.configService.get<string>('keycloak.secret'),
    //   scope: 'openid address',
    //   username: email,
    //   password: password,
    // });
    return await lastValueFrom(
      this.httpService.post(this.url, payload, this.options),
    )
      .then((res) => {
        this.updateUser(email, deviceToken);
        return res.data;
      })
      .catch((e) => {
        throw new UnauthorizedException(e.response?.data || e.message);
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
      await this.adminUserUpdateService.execute(user);
    }
  }
}
