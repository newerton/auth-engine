import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { BadRequestException } from 'src/app.exceptions';
import { FacebookResponse } from '../types/facebook.response.type';

@Injectable()
export class FacebookProvider {
  constructor(private httpService: HttpService) {}

  async me(access_token: string): Promise<FacebookResponse> {
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
      throw new BadRequestException(err.response.data.error);
    }
  }
}
