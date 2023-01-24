import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter/rpc-exception.filter';
import { JoiValidationPipe } from '@app/@common/application/pipes/joi-validation.pipe';
import { Auth } from 'src/schemas/auth.schema';

import { LoginWithProvidersDto } from '../dto/login-with-providers.dto';
import { AuthLoginFacebookUseCase } from '../use-cases/auth-login-facebook.use-case';
import { LoginWithProvidersSchema } from '../validations/login-with-providers.schema.validation';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class AuthLoginFacebookController {
  constructor(private useCase: AuthLoginFacebookUseCase) {}

  @MessagePattern('auth.login.facebook')
  async execute(
    @Payload(new JoiValidationPipe(new LoginWithProvidersSchema()))
    payload: LoginWithProvidersDto,
  ): Promise<Auth> {
    return this.useCase.execute(payload);
  }
}
