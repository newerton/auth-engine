import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter/rpc-exception.filter';
import { ZodValidationPipe } from '@app/@common/application/pipes';
import { Auth } from '@app/@common/application/schemas';

import { LoginWithProvidersDto } from '../dto/login-with-providers.dto';
import { AuthLoginGoogleUseCase } from '../use-cases/auth-login-google.use-case';
import { LoginWithProvidersSchema } from '../validations';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class AuthLoginGoogleController {
  constructor(private useCase: AuthLoginGoogleUseCase) {}

  @MessagePattern('auth.login.google')
  async execute(
    @Payload(new ZodValidationPipe(new LoginWithProvidersSchema()))
    payload: LoginWithProvidersDto,
  ): Promise<Auth> {
    return this.useCase.execute(payload);
  }
}
