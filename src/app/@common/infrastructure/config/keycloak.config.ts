export default () => ({
  keycloak: {
    debug: process.env.KEYCLOAK_DEBUG === '1',
    baseInternalUrl: `${process.env.KEYCLOAK_BASE_INTERNAL_URL}`,
    baseExternalUrl: `${process.env.KEYCLOAK_BASE_EXTERNAL_URL}`,
    realm: process.env.KEYCLOAK_REALM || '',
    clientId: process.env.KEYCLOAK_API_GATEWAY_CLIENT_ID || '',
    secret: process.env.KEYCLOAK_API_GATEWAY_SECRET || '',
    user_credentials: {
      clientId: process.env.KEYCLOAK_USERS_CREDENTIALS_CLIENT_ID || '',
      secret: process.env.KEYCLOAK_USERS_CREDENTIALS_SECRET || '',
      grant_type: 'client_credentials',
    },
  },
});
