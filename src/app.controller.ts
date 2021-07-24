import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import { Auth } from './schemas/auth.schema';
import { LoginSchema } from './validations/login.schema.validation';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { JoiValidationPipe } from './pipes/JoiValidation.pipe';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
}
