import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import { Auth } from './schemas/auth.schema';
import { LoginSchema } from './validations/login.schema.validation';
import { JoiValidationPipe } from './pipes/JoiValidation.pipe';
import { AppService } from './app.service';
import { LoginWithProvidersDto } from './dto/login-with-providers.dto';
import { LoginWithProvidersSchema } from './validations/login-with-providers.schema.validation';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('auth.credentials')
  async credentials(): Promise<Auth> {
    return await this.appService.credentials();
  }

  @MessagePattern('auth.login')
  async login(
    @Payload(new JoiValidationPipe(new LoginSchema()))
    { email, password }: LoginDto,
  ): Promise<Auth> {
    return await this.appService.login({ email, password });
  }

  @MessagePattern('auth.login.facebook')
  async loginWithFacebook(
    @Payload(new JoiValidationPipe(new LoginWithProvidersSchema()))
    payload: LoginWithProvidersDto,
  ): Promise<Auth> {
    return await this.appService.loginWithFacebook(payload);
  }
}
