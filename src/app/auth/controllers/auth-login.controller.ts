import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter/rpc-exception.filter';
import { JoiValidationPipe } from '@app/@common/application/pipes/joi-validation.pipe';
import { Auth } from 'src/schemas/auth.schema';

import { LoginDto } from '../dto/login.dto';
import { AuthLoginUseCase } from '../use-cases/auth-login.use-case';
import { LoginSchema } from '../validations/login.schema.validation';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class AuthLoginController {
  constructor(private useCase: AuthLoginUseCase) {}

  @MessagePattern('auth.login')
  async execute(
    @Payload(new JoiValidationPipe(new LoginSchema()))
    payload: LoginDto,
  ): Promise<Auth> {
    return this.useCase.execute(payload);
  }
}
