import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSessionPhone } from '@/lib/auth/session';

/**
 * GET /api/producer/status
 * Returns the current producer profile status for the authenticated user
 *
 * Pass PRODUCER-ONBOARDING-FIX-01: Replaced mock with Prisma
 * Pass AUTH-UNIFICATION-01: Support lookup via Consumer relation
 */
export async function GET() {
  try {
    const phone = await getSessionPhone();

    if (!phone) {
      // No session - return null status (not an error for unauthenticated users)
      return NextResponse.json({ status: null, profile: null });
    }

    // Pass AUTH-UNIFICATION-01: Try multiple lookup strategies
    const producer = await prisma.producer.findFirst({
      where: {
        OR: [
          { phone },
          { consumer: { phone } }
        ]
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        region: true,
        category: true,
        description: true,
        approvalStatus: true,
        rejectionReason: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!producer) {
      // User is logged in but no producer profile exists
      return NextResponse.json({ status: null, profile: null, profileExists: false });
    }

    // Map Prisma approvalStatus to frontend status
    // - 'approved' + isActive:true → 'active'
    // - 'pending' → 'pending'
    // - 'rejected' or isActive:false → 'inactive'
    const status = producer.approvalStatus === 'approved' && producer.isActive
      ? 'active'
      : producer.approvalStatus === 'pending'
        ? 'pending'
        : 'inactive';

    return NextResponse.json({
      status,
      profile: {
        id: producer.id,
        name: producer.name,
        phone: producer.phone,
        email: producer.email,
        region: producer.region,
        category: producer.category,
        description: producer.description,
        status,
        approvalStatus: producer.approvalStatus,
        rejectionReason: producer.rejectionReason,
        created_at: producer.createdAt.toISOString(),
        updated_at: producer.updatedAt.toISOString(),
      },
      profileExists: true,
      submittedAt: producer.createdAt.toISOString(),
    });

  } catch (error) {
    console.error('[Producer Status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
