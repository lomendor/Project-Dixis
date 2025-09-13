/**
 * Pure auth utility functions for role-based access control
 */

export type UserRole = 'guest' | 'consumer' | 'producer';

/**
 * Role guard functions - pure functions with no side effects
 */
export const isGuestRole = (role: UserRole): boolean => role === 'guest';
export const isConsumerRole = (role: UserRole): boolean => role === 'consumer';
export const isProducerRole = (role: UserRole): boolean => role === 'producer';

/**
 * Cart access permission checker
 */
export const hasCartAccess = (role: UserRole): boolean => {
  switch (role) {
    case 'guest':
      return false;
    case 'consumer':
      return true;
    case 'producer':
      return true; // Limited access
    default:
      return false;
  }
};

/**
 * Get user-friendly role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'guest':
      return 'Guest';
    case 'consumer':
      return 'Consumer';
    case 'producer':
      return 'Producer';
    default:
      return 'Unknown';
  }
};

/**
 * Cart action messages for different roles
 */
export const getCartMessage = (role: UserRole): string => {
  switch (role) {
    case 'guest':
      return 'Login to Add to Cart';
    case 'consumer':
      return 'View Cart';
    case 'producer':
      return 'Producer Cart View';
    default:
      return 'Cart';
  }
};