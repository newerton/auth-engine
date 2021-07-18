export class Users {
  id: string;
  createdTimestamp: number;
  username: string;
  enabled: boolean;
  totp: boolean;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  email: string;
  disableableCredentialTypes: Array<string>;
  requiredActions: Array<string>;
  notBefore: number;
}
