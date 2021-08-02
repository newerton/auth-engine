import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { Headers } from 'src/types/headers.types';
import { HttpService } from '@nestjs/axios';
import { CredentialsService } from 'src/services/credentials.service';
import { BadRequestException, ConflictException } from 'src/app.exceptions';

@Injectable()
export class AdminUserCreateProviderService {
  constructor(
    private credentialService: CredentialsService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  baseUrl = this.configService.get<string>('keycloak.baseUrl');
  realm = this.configService.get<string>('keycloak.realm');
  url = `${this.baseUrl}/admin/realms/${this.realm}/users`;
  options = {
    headers: {} as Headers,
  };

  async execute({ id, identityProvider, userId, userName }): Promise<void> {
    const { access_token } = await this.credentialService.execute();

    if (id && access_token) {
      this.options.headers.authorization = `Bearer ${access_token}`;
      const url = `${this.url}/${id}/federated-identity/${identityProvider}`;
      const payload = { identityProvider, userId, userName };
      return await lastValueFrom(
        this.httpService.post(url, payload, this.options),
      )
        .then(async (res) => res.data)
        .catch((e) => {
          const errorResponse = e.response;
          if (errorResponse.status === 409) {
            throw new ConflictException(errorResponse.data.errorMessage);
          }
          throw new BadRequestException(e.response.data);
        });
    }

    throw new BadRequestException({
      error: '[AdminUserCreateProviderService] Access token invalid',
    });
  }
}
