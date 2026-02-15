import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/admin';
import { logAdminAction } from '@/lib/audit/logger';

/**
 * PATCH /api/admin/categories/[id]
 * Update a category (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    const admin = await requireAdmin();
    const categoryId = params.id;
    const body = await request.json();

    // Extract and validate fields
    const { name, icon, isActive, sortOrder } = body;

    // Validation
    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
      return NextResponse.json(
        { error: 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες' },
        { status: 400 }
      );
    }

    if (sortOrder !== undefined && (typeof sortOrder !== 'number' || sortOrder < 0)) {
      return NextResponse.json(
        { error: 'Η σειρά ταξινόμησης πρέπει να είναι θετικός αριθμός' },
        { status: 400 }
      );
    }

    // Fetch current category for audit log
    const currentCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!currentCategory) {
      return NextResponse.json(
        { error: 'Η κατηγορία δεν βρέθηκε' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (icon !== undefined) {
      updateData.icon = icon || null;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    if (sortOrder !== undefined) {
      updateData.sortOrder = sortOrder;
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData
    });

    // Log admin action
    await logAdminAction({
      admin,
      action: 'CATEGORY_UPDATE',
      entityType: 'category',
      entityId: categoryId,
      oldValue: {
        name: currentCategory.name,
        icon: currentCategory.icon,
        isActive: currentCategory.isActive,
        sortOrder: currentCategory.sortOrder
      },
      newValue: {
        name: updatedCategory.name,
        icon: updatedCategory.icon,
        isActive: updatedCategory.isActive,
        sortOrder: updatedCategory.sortOrder
      }
    });

    return NextResponse.json({
      success: true,
      category: updatedCategory
    });

  } catch (error: unknown) {
    // Handle admin auth errors
    if (error instanceof Error && error.name === 'AdminError') {
      return NextResponse.json(
        { error: 'Απαιτείται πρόσβαση διαχειριστή' },
        { status: 403 }
      );
    }

    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά την ενημέρωση κατηγορίας' },
      { status: 500 }
    );
  }
}
