import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async (tok: string) => {
    try {
      localStorage.setItem('bloomora_token', tok);
      const data = await api.auth.me() as { user: User };
      setUser(data.user || (data as unknown as User));
    } catch {
      localStorage.removeItem('bloomora_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('bloomora_token');
    if (storedToken) {
      setToken(storedToken);
      fetchMe(storedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login({ email, password }) as { token: string; user: User };
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('bloomora_token', data.token);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const data = await api.auth.register({ name, email, password, phone }) as { token: string; user: User };
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('bloomora_token', data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bloomora_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
