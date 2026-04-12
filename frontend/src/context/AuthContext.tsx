import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import api from '../lib/axios';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function decodeUser(token: string): User | null {
  try {
    return JSON.parse(atob(token)) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tf_token'));
  const [user, setUser] = useState<User | null>(() => {
    const t = localStorage.getItem('tf_token');
    return t ? decodeUser(t) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync token changes to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('tf_token', token);
    } else {
      localStorage.removeItem('tf_token');
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/login', {
        email,
        password,
      });
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/register', {
        name,
        email,
        password,
      });
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
