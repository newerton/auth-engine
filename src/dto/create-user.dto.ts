export class CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  passwordCurrent: string;
  repeatPasswordCurrent: string;
  emailVerified: boolean;
  deviceToken?: string;
}
