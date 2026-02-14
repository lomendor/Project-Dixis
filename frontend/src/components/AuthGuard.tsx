'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'consumer' | 'producer' | 'admin';
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  requireRole, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const { user, loading, isAuthenticated, setIntendedDestination } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      setIntendedDestination?.(pathname);
      router.push(redirectTo);
      return;
    }

    // If specific role is required but user doesn't have it
    if (requireRole && user && user.role !== requireRole) {
      // Redirect based on user's actual role
      const destination = user.role === 'producer' ? '/producer/dashboard' : '/';
      router.push(destination);
      return;
    }

  }, [loading, isAuthenticated, user, requireAuth, requireRole, pathname, router, setIntendedDestination, redirectTo]);

  // Show loading state while checking auth
  if (loading) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  // If auth is required but user is not authenticated, don't render children
  // (will be redirected in useEffect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If role is required but user doesn't have it, don't render children
  // (will be redirected in useEffect)
  if (requireRole && user && user.role !== requireRole) {
    return null;
  }

  return <>{children}</>;
}