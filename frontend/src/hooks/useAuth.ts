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
  
  /**
   * Determines if user can access cart functionality
   * Guests: false, Consumers: true, Producers: true (with restrictions)
   */
  const canAccessCart = (role?: 'guest' | 'consumer' | 'producer'): boolean => {
    const userRole = role || (isGuest ? 'guest' : context.user?.role);
    
    switch (userRole) {
      case 'guest':
        return false;
      case 'consumer':
        return true;  
      case 'producer':
        return true; // Producers can view cart but with restrictions
      default:
        return false;
    }
  };

  return {
    ...context,
    isGuest,
    isConsumer, 
    isProducer,
    canAccessCart,
  };
}