export class LoginDto {
  email: string;
  password: string;
}

export class KafkaLoginDto {
  value: LoginDto;
}
