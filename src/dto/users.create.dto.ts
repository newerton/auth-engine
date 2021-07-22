export class UsersCreateDto {
  firstName: string;
  lastName: string;
  email: string;
  passwordCurrent: string;
  repeatPasswordCurrent: string;
  deviceToken: string;
}

export class KafkaUsersCreateDto {
  value: UsersCreateDto;
}
