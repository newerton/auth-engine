import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';

import { AuthGoogleResponse } from '../types/auth-google.response.type';

@Injectable()
export class AuthGoogleProvider {
  constructor(private httpService: HttpService) {}

  async me(access_token: string): Promise<AuthGoogleResponse> {
    try {
      const response = await lastValueFrom(
        this.httpService.get('https://www.googleapis.com/oauth2/v1/userinfo', {
          params: {
            access_token,
          },
        }),
      );
      return response.data;
    } catch (err) {
      throw Exception.new({
        code: Code.BAD_REQUEST.code,
        overrideMessage: err.response.data.error,
      });
    }
  }
}
