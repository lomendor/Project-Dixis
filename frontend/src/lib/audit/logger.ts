import { prisma } from '@/lib/db/client';
import { Prisma } from '@prisma/client';
import type { AdminContext } from '@/lib/auth/admin';

// ============================================
// Types
// ============================================

export type AuditAction =
  | 'PRODUCT_APPROVE'
  | 'PRODUCT_REJECT'
  | 'PRODUCER_APPROVE'
  | 'PRODUCER_REJECT'
  | 'ORDER_STATUS_CHANGE'
  | 'CATEGORY_UPDATE';

export type AuditEntityType = 'product' | 'producer' | 'order' | 'category';

// Use Prisma's InputJsonValue for Json fields
type JsonValue = Prisma.InputJsonValue;

export interface AuditLogInput {
  admin: AdminContext;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  oldValue?: JsonValue;
  newValue?: JsonValue;
  details?: string; // Rejection reason or additional context
}

// ============================================
// Main function
// ============================================

/**
 * Creates an audit log entry for admin actions.
 *
 * @param input - Audit log details
 * @returns Created audit log record
 */
export async function logAdminAction(input: AuditLogInput) {
  const { admin, action, entityType, entityId, oldValue, newValue, details } = input;

  return prisma.adminAuditLog.create({
    data: {
      adminPhone: admin.phone,
      adminUserId: admin.id,
      action,
      entityType,
      entityId,
      oldValue: oldValue ?? null,
      newValue: newValue ?? null,
      details: details ?? null,
      ipAddress: admin.ipAddress,
      userAgent: admin.userAgent
    }
  });
}

// ============================================
// Helper functions for common patterns
// ============================================

/**
 * Creates audit context for approval actions
 */
export function createApprovalContext(entity: {
  approvalStatus?: string;
  isActive?: boolean;
}) {
  return {
    oldValue: {
      approvalStatus: entity.approvalStatus ?? 'pending',
      isActive: entity.isActive ?? true
    },
    newValue: {
      approvalStatus: 'approved',
      isActive: true
    }
  };
}

/**
 * Creates audit context for rejection actions
 */
export function createRejectionContext(
  entity: { approvalStatus?: string; isActive?: boolean },
  rejectionReason: string
) {
  return {
    oldValue: {
      approvalStatus: entity.approvalStatus ?? 'pending',
      isActive: entity.isActive ?? true
    },
    newValue: {
      approvalStatus: 'rejected',
      isActive: false
    },
    details: rejectionReason
  };
}

/**
 * Creates audit context for order status changes
 */
export function createOrderStatusContext(oldStatus: string, newStatus: string) {
  return {
    oldValue: { status: oldStatus },
    newValue: { status: newStatus }
  };
}
