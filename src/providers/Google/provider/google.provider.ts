import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { BadRequestException } from 'src/app.exceptions';
import { GoogleResponse } from '../types/google.response.type';

@Injectable()
export class GoogleProvider {
  constructor(private httpService: HttpService) {}

  async me(access_token: string): Promise<GoogleResponse> {
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
      throw new BadRequestException(err.response.data.error);
    }
  }
}
