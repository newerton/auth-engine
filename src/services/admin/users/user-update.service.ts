import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { Headers } from 'src/types/headers.types';
import { HttpService } from '@nestjs/axios';
import { User } from 'src/types/user.type';
import { CredentialsService } from 'src/services/credentials.service';

@Injectable()
export class AdminUserUpdateService {
  constructor(
    private credentialService: CredentialsService,
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
    const { access_token } = await this.credentialService.execute();

    if (user.id && access_token) {
      this.options.headers.authorization = `Bearer ${access_token}`;
      const url = `${this.url}/${user.id}`;
      return await lastValueFrom(this.httpService.put(url, user, this.options))
        .then(async (res) => res.data)
        .catch((e) => {
          throw new UnauthorizedException(e.response.data);
        });
    }

    throw new UnauthorizedException({
      error: 'Access token invalid',
    });
  }
}
