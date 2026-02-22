'use client';

import Keycloak from 'keycloak-js';
import type React from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

// Configuration - In a real app, use environment variables
const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://auth.ticscreek.top',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'myrealm',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'blog',
};

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | undefined;
  userProfile: Keycloak.KeycloakProfile | undefined;
  login: () => void;
  logout: () => void;
  register: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: undefined,
  userProfile: undefined,
  login: () => {},
  logout: () => {},
  register: () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [userProfile, setUserProfile] = useState<Keycloak.KeycloakProfile | undefined>(undefined);
  const isRun = useRef(false);
  const keycloakRef = useRef<Keycloak | null>(null);

  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;

    const initKeycloak = async () => {
      try {
        const keycloak = new Keycloak(keycloakConfig);
        keycloakRef.current = keycloak;

        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
          checkLoginIframe: false,
        });

        setIsAuthenticated(authenticated);
        if (authenticated) {
          setToken(keycloak.token);
          const profile = await keycloak.loadUserProfile();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Keycloak init failed', error);
      }
    };

    initKeycloak();
  }, []);

  const login = () => keycloakRef.current?.login();
  const logout = () => keycloakRef.current?.logout();
  const register = () => keycloakRef.current?.register();

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, userProfile, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
