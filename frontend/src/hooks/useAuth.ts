'use client';

import { useAuth as useAuthContext } from '@/contexts/AuthContext';

/**
 * Enhanced useAuth hook with role-based utilities
 * Wraps AuthContext with additional cart access logic
 */
export function useAuth() {
  const context = useAuthContext();
  
  const isGuest = !context.isAuthenticated;
  const isConsumer = context.isAuthenticated && context.user?.role === 'consumer';
  const isProducer = context.isAuthenticated && context.user?.role === 'producer';
  const isAdmin = context.isAuthenticated && context.user?.role === 'admin';
  
  /**
   * Determines if user can access cart functionality
   * Guests: false, Consumers: true, Producers: true (with restrictions), Admins: true
   */
  const canAccessCart = (role?: 'guest' | 'consumer' | 'producer' | 'admin'): boolean => {
    const userRole = role || (isGuest ? 'guest' : context.user?.role);

    switch (userRole) {
      case 'guest':
        return false;
      case 'consumer':
        return true;
      case 'producer':
        return true; // Producers can view cart but with restrictions
      case 'admin':
        return true; // Admins have full access
      default:
        return false;
    }
  };

  /**
   * Get current user role with type safety
   */
  const getUserRole = (): 'guest' | 'consumer' | 'producer' | 'admin' => {
    if (isGuest) return 'guest';
    return context.user?.role || 'guest';
  };

  /**
   * Check if user has specific role or higher privileges
   */
  const hasRole = (requiredRole: 'consumer' | 'producer' | 'admin'): boolean => {
    if (!context.isAuthenticated) return false;

    const roleHierarchy = { consumer: 1, producer: 2, admin: 3 };
    const userRoleLevel = roleHierarchy[context.user?.role || 'consumer'] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredLevel;
  };

  return {
    ...context,
    isGuest,
    isConsumer,
    isProducer,
    isAdmin,
    canAccessCart,
    getUserRole,
    hasRole,
  };
}

/**
 * Dedicated hook for role-based logic
 * Use this when you only need role information
 */
export function useUserRole() {
  const { getUserRole, hasRole, isGuest, isConsumer, isProducer, isAdmin } = useAuth();

  return {
    role: getUserRole(),
    hasRole,
    isGuest,
    isConsumer,
    isProducer,
    isAdmin,
  };
}