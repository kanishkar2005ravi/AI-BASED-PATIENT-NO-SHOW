import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { callBackend } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ai_cs_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const login = async (role: UserRole, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await callBackend({
        action: 'LOGIN',
        data: { role, email, password }
      });

      if (response.success && response.user) {
        setUser(response.user);
        return { success: true, message: response.message || 'Login successful', user: response.user };
      } else {
        return { success: false, message: response.message || 'Invalid credentials' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Unable to connect to backend.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
