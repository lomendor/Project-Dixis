'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, apiClient } from '@/lib/api';
import { useToast } from './ToastContext';
import { useCart, CartItem as LocalCartItem } from '@/lib/cart';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  registerLoading?: boolean;
  /**
   * Pass FIX-HOMEPAGE-HYDRATION-01: Indicates hydration is complete.
   * Use this to gate auth-dependent UI that would cause hydration mismatch.
   */
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'consumer' | 'producer' | 'admin';
  }) => Promise<void>;
  logout: () => Promise<void>;
  /**
   * Pass FIX-AUTH-TIMEOUT: Refresh auth state from server (after OTP login)
   */
  refreshAuth: () => Promise<void>;
  isAuthenticated: boolean;
  isProducer: boolean;
  isAdmin: boolean;
  setIntendedDestination?: (destination: string) => void;
  getIntendedDestination?: () => string | null;
  clearIntendedDestination?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convert server cart items to local cart format
 * Pass CART-SYNC-01: Used after sync to update localStorage
 */
function serverToLocalCart(serverItems: { id: number; quantity: number; product: { id: number; name: string; price: string; producer?: { id: number; name: string } }; }[]): LocalCartItem[] {
  return serverItems.map(item => ({
    id: String(item.product.id),
    title: item.product.name,
    priceCents: Math.round(parseFloat(item.product.price) * 100),
    qty: item.quantity,
    producerId: item.product.producer?.id ? String(item.product.producer.id) : undefined,
    producerName: item.product.producer?.name,
  }));
}

/**
 * Pass FIX-HOMEPAGE-HYDRATION-01: Removed getInitialAuthState() that read localStorage during render.
 * This caused hydration mismatch because server rendered with hasToken=false but client rendered
 * with hasToken=true when user was logged in.
 *
 * New approach: Always render as "loading/unknown" on first render (both server and client),
 * then update state in useEffect after hydration completes.
 */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Pass FIX-HOMEPAGE-HYDRATION-01: Start with null user and loading=true on BOTH server and client.
  // This ensures SSR output matches initial client render, preventing hydration mismatch.
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const { showToast } = useToast();
  const { getItemsForSync, replaceWithServerCart } = useCart();

  useEffect(() => {
    // Pass FIX-HOMEPAGE-HYDRATION-01: Mark as hydrated immediately.
    // This allows components to know when it's safe to render auth-dependent UI.
    setIsHydrated(true);

    const initAuth = async () => {
      // MSW Bridge: Short-circuit authentication in MSW mode for smoke tests
      if (typeof window !== 'undefined' && localStorage.getItem('auth_token') === 'mock_token') {
        try {
          const role = (localStorage.getItem('user_role') || 'consumer') as 'consumer' | 'producer';
          setUser({
            id: 1,
            name: 'Test User',
            email: 'test@dixis.local',
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setLoading(false);
          return; // Skip real /auth/me API call
        } catch (error) {
          console.error('MSW auth bridge error:', error);
        }
      }

      // Pass ADMIN-AUTHGUARD-01: Check session-based auth (phone OTP)
      // This syncs client auth state with server JWT for admin users
      try {
        const sessionRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          if (session.authenticated && session.role === 'admin') {
            console.log('[Auth] Admin session detected from JWT');
            setUser({
              id: 0, // Session-based admin users don't have numeric IDs
              name: session.phone,
              email: '',
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            setLoading(false);
            return; // Skip Laravel profile fetch
          }
        }
      } catch (error) {
        // Non-blocking: fall through to normal auth flow
        console.log('[Auth] Session check skipped, using token auth');
      }

      // Normal auth flow
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

      // Pass CART-SYNC-01: Sync localStorage cart with server after login
      try {
        const localItems = getItemsForSync();
        if (localItems.length > 0) {
          console.log('🛒 CartSync: Syncing', localItems.length, 'local items to server...');
          const serverCart = await apiClient.syncCart(localItems);
          // Replace localStorage with authoritative server cart
          const localFormat = serverToLocalCart(serverCart.items);
          replaceWithServerCart(localFormat);
          console.log('🛒 CartSync: Sync complete, server cart has', serverCart.total_items, 'items');
        } else {
          // No local items, fetch server cart to populate localStorage
          console.log('🛒 CartSync: No local items, fetching server cart...');
          const serverCart = await apiClient.getCart();
          if (serverCart.items.length > 0) {
            const localFormat = serverToLocalCart(serverCart.items);
            replaceWithServerCart(localFormat);
            console.log('🛒 CartSync: Loaded', serverCart.total_items, 'items from server');
          }
        }
      } catch (syncError) {
        // Non-blocking: log error but don't fail login
        console.error('🛒 CartSync: Failed to sync cart (non-blocking):', syncError);
      }

      showToast('success', `Καλώς ήρθατε πίσω, ${response.user.name}!`);
      console.log('🔑 AuthContext: Login completed successfully');
    } catch (error: any) {
      console.error('🔑 AuthContext: Login error:', error);

      // Greek error messages based on error type
      let message = 'Η σύνδεση απέτυχε. Παρακαλώ δοκιμάστε ξανά.';

      // Check for specific HTTP status codes
      if (error.response?.status === 401 || error.response?.status === 422) {
        // Invalid credentials
        message = 'Λάθος email ή κωδικός πρόσβασης. Παρακαλώ δοκιμάστε ξανά.';
      } else if (error.response?.status === 429) {
        // Too many login attempts
        message = 'Πάρα πολλές προσπάθειες σύνδεσης. Παρακαλώ περιμένετε λίγο και δοκιμάστε ξανά.';
      } else if (error.response?.status === 500) {
        // Server error
        message = 'Παρουσιάστηκε πρόβλημα με τον διακομιστή. Παρακαλώ δοκιμάστε ξανά σε λίγο.';
      } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
        // Network timeout or connection error
        message = 'Η σύνδεση διήρκεσε πολύ. Παρακαλώ ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.';
      }

      // For E2E tests that expect "invalid" keyword, add it in English as well
      const testMessage = message.toLowerCase().includes('λάθος')
        ? `Invalid credentials - ${message}`
        : message;

      showToast('error', message);
      throw new Error(testMessage);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'consumer' | 'producer' | 'admin';
  }) => {
    try {
      setRegisterLoading(true);
      const response = await apiClient.register(data);
      setUser(response.user);

      // Greek success message based on role
      const accountType = data.role === 'producer' ? 'Παραγωγού' : 'Καταναλωτή';
      showToast('success', `Καλώς ήρθατε στο Dixis, ${response.user.name}! Ο λογαριασμός ${accountType} δημιουργήθηκε με επιτυχία.`);
    } catch (error: any) {
      // Greek error messages based on error type
      let message = 'Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.';

      // Check for specific HTTP status codes
      if (error.response?.status === 422) {
        // Validation error
        const errorData = error.response?.data;
        if (errorData?.errors) {
          // Extract first error message
          const firstError = Object.values(errorData.errors)[0];
          if (Array.isArray(firstError) && firstError[0]) {
            // Map common Laravel validation messages to Greek
            const errorMsg = String(firstError[0]).toLowerCase();
            if (errorMsg.includes('email') && errorMsg.includes('taken')) {
              message = 'Το email χρησιμοποιείται ήδη. Δοκιμάστε να συνδεθείτε ή χρησιμοποιήστε άλλο email.';
            } else if (errorMsg.includes('password')) {
              message = 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.';
            } else {
              message = 'Παρακαλώ ελέγξτε τα στοιχεία σας και δοκιμάστε ξανά.';
            }
          }
        } else {
          message = 'Παρακαλώ ελέγξτε τα στοιχεία σας και δοκιμάστε ξανά.';
        }
      } else if (error.response?.status === 409) {
        // Conflict - email exists
        message = 'Το email υπάρχει ήδη. Δοκιμάστε να συνδεθείτε.';
      } else if (error.response?.status === 500) {
        // Server error
        message = 'Παρουσιάστηκε πρόβλημα με τον διακομιστή. Παρακαλώ δοκιμάστε ξανά σε λίγο.';
      } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
        // Network timeout or connection error
        message = 'Η σύνδεση διήρκεσε πολύ. Παρακαλώ ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.';
      } else if (error.response?.status === 429) {
        // Too many requests
        message = 'Πάρα πολλές προσπάθειες. Παρακαλώ περιμένετε λίγο και δοκιμάστε ξανά.';
      }

      showToast('error', message);
      throw new Error(message);
    } finally {
      setRegisterLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      showToast('info', 'You have been logged out successfully');
    } catch (error) {
      // Ignore logout errors and proceed with clearing local state
      console.error('Logout error:', error);
      showToast('info', 'You have been logged out');
    }

    setUser(null);
  };

  /**
   * Pass FIX-AUTH-TIMEOUT: Refresh auth state from server session
   * Called after OTP verification to sync client state with JWT cookie
   */
  const refreshAuth = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        if (session.authenticated) {
          console.log(`[Auth] Session refresh: ${session.role} user authenticated`);
          setUser({
            id: 0, // Session-based users don't have numeric IDs
            name: session.phone,
            email: '',
            role: session.role === 'admin' ? 'admin' : 'consumer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          showToast('success', 'Επιτυχής σύνδεση!');
        }
      }
    } catch (error) {
      console.error('[Auth] Failed to refresh auth:', error);
    }
  };

  // Pass FIX-HOMEPAGE-HYDRATION-01: isAuthenticated is now simple - just based on user presence.
  // The UI flash issue is handled by Header showing loading state until isHydrated && !loading.
  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    loading,
    registerLoading,
    isHydrated,
    login,
    register,
    logout,
    refreshAuth,
    isAuthenticated,
    isProducer: user?.role === 'producer',
    isAdmin: user?.role === 'admin',
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