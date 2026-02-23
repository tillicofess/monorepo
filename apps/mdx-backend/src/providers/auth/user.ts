export interface KeycloakUser {
  sub: string;
  preferred_username?: string;
  email?: string;
  name?: string;
  roles?: string[];
}
