import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Users } from 'src/schemas/users.schema';
import { UsersCreateDto } from 'src/dto/users.create.dto';
import { HttpService } from '@nestjs/axios';
import { Observable, catchError, map } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Headers } from 'src/types/headers.types';
import { UnauthorizedException } from 'src/app.exceptions';

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
    headers: {},
  };

  create(
    userDto: UsersCreateDto,
    headers: Headers,
  ): Observable<AxiosResponse<Users>> {
    const {
      firstName,
      lastName,
      email,
      passwordCurrent,
      repeatPasswordCurrent,
      deviceToken,
    } = userDto;

    const payload = {
      username: email,
      firstName,
      lastName,
      email,
      groups: ['/User'],
      emailVerified: false,
      enabled: true,
    };

    this.headers.headers['Authorization'] = headers.authorization;

    return this.httpService.post(this.url, payload, this.headers).pipe(
      map((res) => res.data),
      catchError((e) => {
        throw new UnauthorizedException(e.response.data);
      }),
    );
  }
}
