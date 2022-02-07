import { Controller } from '@nestjs/common';
import {
  EventPattern,
  MessagePattern,
  Payload,
  Transport,
} from '@nestjs/microservices';
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
    payload: LoginDto,
  ): Promise<Auth> {
    return await this.appService.login(payload);
  }

  @MessagePattern('auth.login.facebook')
  async loginWithFacebook(
    @Payload(new JoiValidationPipe(new LoginWithProvidersSchema()))
    payload: LoginWithProvidersDto,
  ): Promise<Auth> {
    return await this.appService.loginWithFacebook(payload);
  }

  @MessagePattern('auth.login.google')
  async loginWithGoogle(
    @Payload(new JoiValidationPipe(new LoginWithProvidersSchema()))
    payload: LoginWithProvidersDto,
  ): Promise<Auth> {
    return await this.appService.loginWithGoogle(payload);
  }

  @EventPattern('product_created', Transport.KAFKA)
  async handleProductCreated(data: Record<string, unknown>) {
    console.log('product_created');
    console.log(data);
  }
}
