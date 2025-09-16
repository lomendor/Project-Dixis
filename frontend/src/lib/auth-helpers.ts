/**
 * Access Control Helpers for Producer Onboarding
 * Provides utilities for checking producer approval status and permissions
 */

import { User, ProducerProfile } from './models';

export type UserRole = 'consumer' | 'producer' | 'admin';

/**
 * Check if user has the specified role or higher privileges
 */
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;

  const roleHierarchy: Record<UserRole, number> = {
    consumer: 1,
    producer: 2,
    admin: 3,
  };

  const userRoleLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userRoleLevel >= requiredLevel;
}

/**
 * Check if user is an approved producer
 */
export function isProducerApproved(
  user: User | null,
  producerProfile: ProducerProfile | null
): boolean {
  if (!user || !producerProfile) return false;

  // User must have producer role and profile must be active
  return user.role === 'producer' && producerProfile.status === 'active';
}

/**
 * Check if user can access producer dashboard
 */
export function canAccessProducerDashboard(user: User | null): boolean {
  return hasRole(user, 'producer');
}

/**
 * Check if user can access producer products management
 */
export function canAccessProducerProducts(
  user: User | null,
  producerProfile: ProducerProfile | null
): boolean {
  return isProducerApproved(user, producerProfile);
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Get redirect path based on user role and approval status
 */
export function getRedirectPath(
  user: User | null,
  producerProfile: ProducerProfile | null,
  intendedPath?: string
): string {
  if (!user) {
    return '/auth/login';
  }

  // Admin users can access everything
  if (user.role === 'admin') {
    return intendedPath || '/admin';
  }

  // Producer role logic
  if (user.role === 'producer') {
    // If trying to access products but not approved
    if (intendedPath?.startsWith('/producer/products')) {
      if (!isProducerApproved(user, producerProfile)) {
        return '/producer/onboarding';
      }
    }

    // Default producer destination
    if (isProducerApproved(user, producerProfile)) {
      return intendedPath || '/producer/dashboard';
    } else {
      return '/producer/onboarding';
    }
  }

  // Consumer role
  if (user.role === 'consumer') {
    return intendedPath || '/';
  }

  // Fallback
  return '/';
}

/**
 * Check if path requires specific permissions
 */
export function requiresPermission(path: string): {
  requiresAuth: boolean;
  requiredRole?: UserRole;
  requiresApproval?: boolean;
} {
  // Admin routes
  if (path.startsWith('/admin')) {
    return {
      requiresAuth: true,
      requiredRole: 'admin',
    };
  }

  // Producer routes
  if (path.startsWith('/producer')) {
    const result = {
      requiresAuth: true,
      requiredRole: 'producer' as UserRole,
    };

    // Producer products requires approval
    if (path.startsWith('/producer/products')) {
      return {
        ...result,
        requiresApproval: true,
      };
    }

    return result;
  }

  // Public routes
  return {
    requiresAuth: false,
  };
}

/**
 * Producer status descriptions in Greek
 */
export const PRODUCER_STATUS_LABELS: Record<string, string> = {
  pending: 'Εκκρεμότητα',
  active: 'Εγκεκριμένος',
  inactive: 'Απορρίφθηκε',
};

/**
 * Producer status colors for UI
 */
export const PRODUCER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
};

/**
 * Validation helpers
 */
export const validation = {
  displayName: (value: string): string | null => {
    if (!value?.trim()) {
      return 'Το όνομα εμφάνισης είναι υποχρεωτικό';
    }
    if (value.trim().length < 2) {
      return 'Το όνομα εμφάνισης πρέπει να έχει τουλάχιστον 2 χαρακτήρες';
    }
    return null;
  },

  taxId: (value: string): string | null => {
    if (value && value.trim()) {
      // Basic Greek AFM validation (9 digits)
      const afm = value.trim().replace(/\D/g, '');
      if (afm.length !== 9) {
        return 'Ο ΑΦΜ πρέπει να έχει 9 ψηφία';
      }
    }
    return null;
  },

  phone: (value: string): string | null => {
    if (value && value.trim()) {
      // Basic phone validation
      const phone = value.trim().replace(/\s/g, '');
      if (phone.length < 10) {
        return 'Εισάγετε έγκυρο αριθμό τηλεφώνου';
      }
    }
    return null;
  },
};

/**
 * Format producer profile for display
 */
export function formatProducerProfile(profile: ProducerProfile) {
  return {
    ...profile,
    statusLabel: PRODUCER_STATUS_LABELS[profile.status] || profile.status,
    statusColor: PRODUCER_STATUS_COLORS[profile.status] || 'bg-gray-100 text-gray-800',
    submittedAt: new Date(profile.created_at).toLocaleDateString('el-GR'),
    updatedAt: new Date(profile.updated_at).toLocaleDateString('el-GR'),
  };
}