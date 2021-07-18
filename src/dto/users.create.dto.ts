export class UsersCreateDto {
  firstName: string;
  lastName: string;
  email: string;
}

export class KafkaUsersCreateDto {
  value: UsersCreateDto;
}
