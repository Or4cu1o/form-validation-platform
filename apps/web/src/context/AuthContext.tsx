import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchCurrentUser, login as loginRequest } from '../api/auth';
import { UNAUTHORIZED_EVENT } from '../lib/api-client';
import { clearStoredToken, getStoredToken, setStoredToken } from '../lib/token-storage';
import type { AuthenticatedUser } from '../types/api';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => getStoredToken() !== null);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  useEffect(() => {
    if (!getStoredToken()) return;

    fetchCurrentUser()
      .then(setUser)
      .catch(() => clearStoredToken())
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const login = useCallback(async (identifier: string, password: string) => {
    const response = await loginRequest(identifier, password);
    setStoredToken(response.accessToken);
    setUser(response.user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
