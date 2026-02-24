import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import keycloak from './keycloak';
import type { KeycloakUser } from './user';

interface AuthContextValue {
  isAuthenticated: boolean;
  user: KeycloakUser | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<KeycloakUser | null>(null);

  useEffect(() => {
    keycloak.onAuthLogout = () => {
      setAuthenticated(false);
      setUser(null);
    };

    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'login-required',
          pkceMethod: 'S256',
        });

        setAuthenticated(authenticated);
        if (authenticated) {
          console.log(keycloak.tokenParsed);
          setUser({
            sub: keycloak.tokenParsed?.sub || '',
            email: keycloak.tokenParsed?.email || '',
            name: keycloak.tokenParsed?.name || '',
            roles: keycloak.tokenParsed?.realm_access?.roles || [],
          });
        }
      } catch (err) {
        console.error('Keycloak init failed', err);
      }
    };

    initKeycloak();
  }, []);

  const login = () => keycloak.login();

  const logout = () => keycloak.logout();

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
