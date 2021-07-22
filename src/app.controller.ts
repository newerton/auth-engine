import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './services/app.service';
import { LoginDto } from './dto/login.dto';
import { Auth } from './schemas/auth.schema';
import { UsersService } from './services/users.service';
import { LoginSchema } from './validations/login.schema.validation';
import { UsersCreateSchema } from './validations/users.create.schema.validation';
import { Users } from './schemas/users.schema';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { UserCreatePayload } from './types/users.types';
import { JoiValidationPipe } from './pipes/JoiValidation.pipe';
import { UsersCreateDto } from './dto/users.create.dto';
import { Headers } from './types/headers.types';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
  ) {}

  @MessagePattern('auth.login')
  login(
    @Payload(new JoiValidationPipe(new LoginSchema()))
    { email, password }: LoginDto,
  ): Observable<AxiosResponse<Auth>> {
    return this.appService.login({ email, password });
  }

  @MessagePattern('auth.credentials')
  credentials(): Observable<AxiosResponse<Auth>> {
    return this.appService.credentials();
  }

  @MessagePattern('auth.users.create')
  usersCreate(
    @Payload('user', new JoiValidationPipe(new UsersCreateSchema()))
    user: UsersCreateDto,
    @Payload('headers')
    headers: Headers,
  ): Observable<AxiosResponse<Users>> {
    return this.usersService.create(user, headers);
  }
}
