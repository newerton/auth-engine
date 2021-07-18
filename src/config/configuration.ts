export default () => ({
  keycloak: {
    debug: process.env.DEBUG === '1',
    baseUrl: `${process.env.KEYCLOAK_BASE_URL}/auth`,
    realm: process.env.KEYCLOAK_REALM || '',
    clientId: process.env.KEYCLOAK_CLIENT_ID || '',
    secret: process.env.KEYCLOAK_SECRET || '',
    user_credentials: {
      clientId: process.env.KEYCLOAK_USERS_CREDENTIALS_CLIENT_ID || '',
      secret: process.env.KEYCLOAK_USERS_CREDENTIALS_SECRET || '',
      grant_type: 'client_credentials',
    },
  },
});
