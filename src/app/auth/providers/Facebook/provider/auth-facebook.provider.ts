import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';

import { AuthFacebookResponse } from '../types/auth-facebook.response.type';

@Injectable()
export class AuthFacebookProvider {
  constructor(private httpService: HttpService) {}

  async me(access_token: string): Promise<AuthFacebookResponse> {
    try {
      const response = await lastValueFrom(
        this.httpService.get('https://graph.facebook.com/v6.0/me', {
          params: {
            fields:
              'id,name,email,first_name,last_name,middle_name,name_format,short_name',
            access_token,
          },
        }),
      );
      return response.data;
    } catch (err) {
      throw Exception.new({
        code: Code.BAD_REQUEST,
        overrideMessage: err.response.data.error,
      });
    }
  }
}
