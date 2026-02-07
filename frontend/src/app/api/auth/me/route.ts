import { NextResponse } from 'next/server';
import { getSessionPhone, getSessionType } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/auth/me
 * Returns session info from JWT cookie
 *
 * Pass ADMIN-AUTHGUARD-01: Sync client auth state with server JWT
 * Pass AUTH-UNIFICATION-01: Include producer status in response
 */
export async function GET() {
  try {
    const phone = await getSessionPhone();
    const type = await getSessionType();

    if (!phone) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Check if user is also a producer
    let producerStatus = null;
    try {
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
          approvalStatus: true,
          isActive: true,
        }
      });

      if (producer) {
        producerStatus = {
          id: producer.id,
          name: producer.name,
          approvalStatus: producer.approvalStatus,
          isActive: producer.isActive,
          canAccess: producer.approvalStatus === 'approved' && producer.isActive,
        };
      }
    } catch (dbError) {
      // Non-blocking: producer check failure shouldn't break auth
      console.error('[Auth Me] Producer check error:', dbError);
    }

    return NextResponse.json({
      authenticated: true,
      phone,
      type, // 'admin' | 'user'
      role: type === 'admin' ? 'admin' : 'consumer',
      producer: producerStatus,
    });
  } catch (error) {
    console.error('[Auth Me] Error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
