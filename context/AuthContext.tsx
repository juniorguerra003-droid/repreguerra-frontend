'use client';

/**
 * context/AuthContext.tsx
 *
 * Gestiona el estado de autenticación del cliente (rol CLIENTE).
 * Completamente independiente del flujo de admin (adminToken).
 *
 * Almacena en localStorage:
 *  - clientToken   → JWT generado por el backend
 *  - clientUser    → JSON { id, nombre, email, rol }
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export interface ClientUser {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string;
  direccion_defecto?: string;
}

interface AuthState {
  user: ClientUser | null;
  token: string | null;
  isHydrated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: ClientUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<ClientUser>) => void;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isHydrated: false,
  });

  // Hidratar desde localStorage (solo en cliente)
  useEffect(() => {
    try {
      const token = localStorage.getItem('clientToken');
      const userRaw = localStorage.getItem('clientUser');
      const user: ClientUser | null = userRaw ? JSON.parse(userRaw) : null;
      setState({ user, token, isHydrated: true });
    } catch {
      setState({ user: null, token: null, isHydrated: true });
    }
  }, []);

  const login = useCallback((token: string, user: ClientUser) => {
    localStorage.setItem('clientToken', token);
    localStorage.setItem('clientUser', JSON.stringify(user));
    setState({ user, token, isHydrated: true });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    setState({ user: null, token: null, isHydrated: true });
  }, []);

  const updateUser = useCallback((updates: Partial<ClientUser>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const newUser = { ...prev.user, ...updates };
      localStorage.setItem('clientUser', JSON.stringify(newUser));
      return { ...prev, user: newUser };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
