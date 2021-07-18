import { HttpService, Injectable, UnauthorizedException } from '@nestjs/common';
import * as qs from 'qs';
import { ConfigService } from '@nestjs/config';
import { Users } from 'src/schemas/users.schema';
import { UsersCreateDto } from 'src/dto/users.create.dto';

@Injectable()
export class UsersService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  baseUrl = this.configService.get<string>('keycloak.baseUrl');
  realm = this.configService.get<string>('keycloak.realm');

  url = `${this.baseUrl}/admin/realms/${this.realm}/users`;

  headers = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  async create({ firstName, lastName, email }: UsersCreateDto): Promise<Users> {
    let response: { data: Users };
    const payload = qs.stringify({
      username: email,
      firstName,
      lastName,
      email,
      groups: ['/User'],
      emailVerified: false,
      enabled: true,
    });
    console.log(payload);
    try {
      response = await this.httpService
        .post(this.url, payload, this.headers)
        .toPromise();
    } catch (e) {
      console.log(e.response);
      throw new UnauthorizedException();
    }

    return response.data;
  }
}
