'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, apiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginLoading: boolean;
  registerLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'consumer' | 'producer';
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isProducer: boolean;
  setIntendedDestination: (path: string) => void;
  getIntendedDestination: () => string;
  clearIntendedDestination: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Refresh token from localStorage to handle race conditions
      apiClient.refreshToken();
      const token = apiClient.getToken();
      
      if (token) {
        try {
          const userData = await apiClient.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Clear invalid token
          apiClient.setToken(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoginLoading(true);
      console.log('🔑 AuthContext: Calling API login...');
      const response = await apiClient.login(email, password);
      console.log('🔑 AuthContext: API login response:', response);
      console.log('🔑 AuthContext: Setting user state...', response.user);
      setUser(response.user);
      console.log('🔑 AuthContext: Login completed successfully');
    } catch (error) {
      console.error('🔑 AuthContext: Login error:', error);
      throw error;
    } finally {
      setLoginLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'consumer' | 'producer';
  }) => {
    try {
      setRegisterLoading(true);
      const response = await apiClient.register(data);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setRegisterLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Ignore logout errors and proceed with clearing local state
      console.error('Logout error:', error);
    }
    
    setUser(null);
    clearIntendedDestination();
  };

  // Intended destination functionality for smart redirects
  const setIntendedDestination = (path: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('intended_destination', path);
    }
  };

  const getIntendedDestination = (): string => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('intended_destination') || '/';
    }
    return '/';
  };

  const clearIntendedDestination = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('intended_destination');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    loginLoading,
    registerLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isProducer: user?.role === 'producer',
    setIntendedDestination,
    getIntendedDestination,
    clearIntendedDestination,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}