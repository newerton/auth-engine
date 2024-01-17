import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter/rpc-exception.filter';
import { ZodValidationPipe } from '@app/@common/application/pipes';
import { Auth } from '@app/@common/application/schemas';

import { LoginDto } from '../dto';
import { AuthLoginUseCase } from '../use-cases';
import { LoginSchema } from '../validations';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class AuthLoginController {
  constructor(private useCase: AuthLoginUseCase) {}

  @MessagePattern('auth.login')
  async execute(
    @Payload(new ZodValidationPipe(new LoginSchema()))
    payload: LoginDto,
  ): Promise<Auth> {
    return this.useCase.execute(payload);
  }
}
