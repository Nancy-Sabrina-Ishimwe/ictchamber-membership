import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { setToken, clearToken, getToken } from '../lib/api';
import { loginApi, getMeApi, logoutApi } from '../services/authService';

// ─── Types ─────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'member';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  /** Company name (member accounts) */
  companyName?: string;
  /** Membership tier slug, e.g. "gold" */
  tier?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

// ─── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'ict_auth_user';

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session: if a token exists, validate it with GET /auth/me
  useEffect(() => {
    const rehydrate = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const authUser = await getMeApi();
        setUser(authUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      } catch {
        // Token is invalid or expired — clear everything
        clearToken();
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    rehydrate();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const { token } = await loginApi(email, password);
    setToken(token);
    const me = await getMeApi();
    setUser(me);
    localStorage.setItem(SESSION_KEY, JSON.stringify(me));
    return me;
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    clearToken();
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
