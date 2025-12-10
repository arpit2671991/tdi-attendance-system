import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from './api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: 'admin' | 'teacher') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user } = await authApi.getMe();
      setUser(user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, role: 'admin' | 'teacher') => {
    const { user } = await authApi.login(email, password, role);
    setUser(user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
