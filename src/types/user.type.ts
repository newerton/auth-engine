export type User = {
  id: string;
  createdTimestamp: number;
  username: string;
  enabled: boolean;
  totp: boolean;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  email: string;
  attributes: Array<{ [key: string]: [string] }>;
  disableableCredentialTypes: [];
  requiredActions: [];
  federatedIdentities: Array<{ [key: string]: string }>;
  notBefore: number;
  access: { [key: string]: string };
};
