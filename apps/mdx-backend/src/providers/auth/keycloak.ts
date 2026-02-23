import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://auth.ticscreek.top',
  realm: 'myrealm',
  clientId: 'middlePlatform',
});

export default keycloak;
