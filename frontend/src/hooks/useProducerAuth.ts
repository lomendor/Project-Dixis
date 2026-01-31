'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { ProducerProfile } from '@/lib/models';
import {
  isProducerApproved,
  canAccessProducerProducts,
  getRedirectPath,
} from '@/lib/auth-helpers';

interface ProducerAuthState {
  profile: ProducerProfile | null;
  loading: boolean;
  error: string | null;
  isApproved: boolean;
  canAccessProducts: boolean;
}

/**
 * Hook for producer-specific authentication and authorization
 * Provides producer profile status and access control
 */
export function useProducerAuth() {
  const { user, isAuthenticated, isProducer } = useAuth();

  const [state, setState] = useState<ProducerAuthState>({
    profile: null,
    loading: true,
    error: null,
    isApproved: false,
    canAccessProducts: false,
  });

  // Load producer profile when user changes
  useEffect(() => {
    if (isAuthenticated && isProducer && user?.id) {
      loadProducerProfile();
    } else {
      // Reset state for non-producers
      setState({
        profile: null,
        loading: false,
        error: null,
        isApproved: false,
        canAccessProducts: false,
      });
    }
  }, [isAuthenticated, isProducer, user?.id]);

  const loadProducerProfile = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/producer/status', {
        headers: {
          'Authorization': `Bearer mock_token`, // Mock token for testing
        },
      });

      if (response.ok) {
        const data = await response.json();
        const profile = data.profile;

        setState({
          profile,
          loading: false,
          error: null,
          isApproved: isProducerApproved(user, profile),
          canAccessProducts: canAccessProducerProducts(user, profile),
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Αποτυχία φόρτωσης προφίλ παραγωγού',
        }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Σφάλμα δικτύου',
      }));
    }
  };

  const refreshProfile = () => {
    if (isAuthenticated && isProducer && user?.id) {
      loadProducerProfile();
    }
  };

  const getRedirectPathForRoute = (intendedPath?: string): string => {
    return getRedirectPath(user, state.profile, intendedPath);
  };

  return {
    // State
    ...state,

    // User info
    user,
    isAuthenticated,
    isProducer,

    // Actions
    refreshProfile,
    getRedirectPathForRoute,

    // Status checks
    isPending: state.profile?.status === 'pending',
    isActive: state.profile?.status === 'active',
    isRejected: state.profile?.status === 'inactive',
    hasProfile: !!state.profile,
  };
}

/**
 * Hook for checking if current route requires producer approval
 */
export function useProducerRouteGuard() {
  const { isApproved, canAccessProducts, user, profile, getRedirectPathForRoute } = useProducerAuth();

  const checkRouteAccess = (path: string): {
    hasAccess: boolean;
    redirectTo?: string;
    reason?: string;
  } => {
    // Admin users have full access
    if (user?.role === 'admin') {
      return { hasAccess: true };
    }

    // Producer routes
    if (path.startsWith('/producer')) {
      // Must be authenticated producer
      if (user?.role !== 'producer') {
        return {
          hasAccess: false,
          redirectTo: '/auth/login',
          reason: 'Απαιτείται σύνδεση ως παραγωγός',
        };
      }

      // Products route requires active status
      if (path.startsWith('/producer/products')) {
        if (!canAccessProducts) {
          return {
            hasAccess: false,
            redirectTo: '/producer/onboarding',
            reason: 'Ολοκληρώστε το προφίλ σας για πρόσβαση στα προϊόντα',
          };
        }
      }

      return { hasAccess: true };
    }

    // Admin routes
    if (path.startsWith('/admin')) {
      if ((user?.role as 'consumer' | 'producer' | 'admin') !== 'admin') {
        return {
          hasAccess: false,
          redirectTo: '/',
          reason: 'Δεν έχετε δικαιώματα διαχειριστή',
        };
      }
      return { hasAccess: true };
    }

    // Public routes
    return { hasAccess: true };
  };

  return {
    checkRouteAccess,
    isApproved,
    canAccessProducts,
  };
}