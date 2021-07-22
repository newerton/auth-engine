import { UsersCreateDto } from 'src/dto/users.create.dto';
import { Headers } from './headers.types';

export type UserCreatePayload = {
  user: UsersCreateDto;
  headers: Headers;
};
