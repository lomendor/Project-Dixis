'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
      console.log('🛡️ AuthGuard: User not authenticated, redirecting to login');
      setIntendedDestination?.(pathname);
      router.push(redirectTo);
      return;
    }

    // If specific role is required but user doesn't have it
    if (requireRole && user && user.role !== requireRole) {
      console.log(`🛡️ AuthGuard: User role ${user.role} doesn't match required role ${requireRole}`);
      
      // Redirect based on user's actual role
      const destination = user.role === 'producer' ? '/producer/dashboard' : 
                         user.role === 'admin' ? '/admin' : '/';
      router.push(destination);
      return;
    }

    console.log('🛡️ AuthGuard: Access granted');
  }, [loading, isAuthenticated, user, requireAuth, requireRole, pathname, router, setIntendedDestination, redirectTo]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
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