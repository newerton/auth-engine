export class LoginDto {
  email: string;
  password: string;
  deviceToken: string;
}

export class KafkaLoginDto {
  value: LoginDto;
}
