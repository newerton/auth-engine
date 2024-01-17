import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern } from '@nestjs/microservices';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter/rpc-exception.filter';
import { Auth } from '@app/@common/application/schemas';

import { AuthCredentialsUseCase } from '../use-cases/auth.credentials.use-case';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class AuthCredentialsController {
  constructor(private useCase: AuthCredentialsUseCase) {}

  @MessagePattern('auth.credentials')
  async execute(): Promise<Auth> {
    return this.useCase.execute();
  }
}
