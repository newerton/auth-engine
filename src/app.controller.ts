import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './services/app.service';
import { KafkaLoginDto } from './dto/login.dto';
import { KafkaUsersCreateDto } from './dto/users.create.dto';
import { JoiValidationKafkaPipe } from './pipes/joi.validation.kafka.pipe';
import { Auth } from './schemas/auth.schema';
import { UsersService } from './services/users.service';
import { LoginSchema } from './validations/login.schema.validation';
import { UsersCreateSchema } from './validations/users.create.schema.validation';
import { Users } from './schemas/users.schema';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
  ) {}

  @MessagePattern('auth.login')
  async login(
    @Payload(new JoiValidationKafkaPipe(new LoginSchema()))
    { value }: KafkaLoginDto,
  ): Promise<Auth> {
    return await this.appService.login(value);
  }

  @MessagePattern('auth.credentials')
  async credentials(): Promise<Auth> {
    return await this.appService.credentials();
  }

  @MessagePattern('auth.users.create')
  async usersCreate(
    @Payload(new JoiValidationKafkaPipe(new UsersCreateSchema()))
    { value }: KafkaUsersCreateDto,
  ): Promise<Users> {
    return await this.usersService.create(value);
  }
}
