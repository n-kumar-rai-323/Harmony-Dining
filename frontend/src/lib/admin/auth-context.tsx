'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { adminApi, AdminApiError } from './api';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type MeResponse = {
  user: AdminUser;
  permissions: string[];
};

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: AdminUser; permissions: string[] }
  | { status: 'anonymous' };

type AdminAuthContextValue = {
  state: AuthState;
  /** Re-fetches /auth/me. Returns true when authenticated. */
  refresh: () => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (key: string) => boolean;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });
  const inFlight = useRef<Promise<boolean> | null>(null);

  const refresh = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) return inFlight.current;
    const run = (async () => {
      try {
        const me = await adminApi.get<MeResponse>('/auth/me');
        setState({
          status: 'authenticated',
          user: me.user,
          permissions: me.permissions,
        });
        return true;
      } catch (err) {
        if (err instanceof AdminApiError && err.status !== 0 && !err.isAuth) {
          // A non-auth error (network/500) — surface as anonymous but do not loop.
          setState({ status: 'anonymous' });
          return false;
        }
        setState({ status: 'anonymous' });
        return false;
      } finally {
        inFlight.current = null;
      }
    })();
    inFlight.current = run;
    return run;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi.post('/auth/logout');
    } catch {
      // Even if the call fails, drop local auth state.
    }
    setState({ status: 'anonymous' });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AdminAuthContextValue>(() => {
    const permissions =
      state.status === 'authenticated' ? state.permissions : [];
    const perms = new Set(permissions);
    return {
      state,
      refresh,
      logout,
      hasPermission: (key: string) => perms.has(key),
    };
  }, [state, refresh, logout]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within <AdminAuthProvider>');
  }
  return ctx;
}
