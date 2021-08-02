import { Injectable } from '@nestjs/common';
import { LoginDto } from 'src/dto/login.dto';
import { Auth } from 'src/schemas/auth.schema';
import { LoginWithProvidersDto } from './dto/login-with-providers.dto';
import { CredentialsService } from './services/credentials.service';
import { LoginService } from './services/login.service';
import { LoginWithFacebookService } from './services/login-with-facebook.service';

@Injectable()
export class AppService {
  constructor(
    private credentialsService: CredentialsService,
    private loginService: LoginService,
    private loginWithFacebookService: LoginWithFacebookService,
  ) {}

  async credentials(): Promise<Auth> {
    return await this.credentialsService.execute();
  }

  async login({ email, password }: LoginDto): Promise<Auth> {
    return await this.loginService.execute({ email, password });
  }

  async loginWithFacebook({
    accessToken,
    deviceToken,
  }: LoginWithProvidersDto): Promise<Auth> {
    return this.loginWithFacebookService.execute({ accessToken, deviceToken });
  }
}
