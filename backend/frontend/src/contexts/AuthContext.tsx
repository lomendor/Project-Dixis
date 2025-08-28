'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, apiClient } from '@/lib/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  registerLoading?: boolean;
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
  setIntendedDestination?: (destination: string) => void;
  getIntendedDestination?: () => string | null;
  clearIntendedDestination?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

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
      console.log('🔑 AuthContext: Calling API login...');
      const response = await apiClient.login(email, password);
      console.log('🔑 AuthContext: API login response:', response);
      console.log('🔑 AuthContext: Setting user state...', response.user);
      setUser(response.user);
      showToast(`Welcome back, ${response.user.name}!`, 'success');
      console.log('🔑 AuthContext: Login completed successfully');
    } catch (error) {
      console.error('🔑 AuthContext: Login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      showToast(message, 'error');
      throw error;
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
      const response = await apiClient.register(data);
      setUser(response.user);
      showToast(`Welcome to Project Dixis, ${response.user.name}!`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      showToast(message, 'error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      showToast('You have been logged out successfully', 'info');
    } catch (error) {
      // Ignore logout errors and proceed with clearing local state
      console.error('Logout error:', error);
      showToast('You have been logged out', 'info');
    }
    
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isProducer: user?.role === 'producer',
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