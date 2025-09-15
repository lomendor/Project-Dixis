import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/producers/[id]/approve
 * Approves a producer application (sets status to 'active')
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const producerId = parseInt(params.id);

    if (isNaN(producerId)) {
      return NextResponse.json({ error: 'Invalid producer ID' }, { status: 400 });
    }

    // Mock authentication and admin role check
    const userToken = request.headers.get('authorization');
    const user = getCurrentUser(userToken);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock producer approval
    const updatedProfile = await approveProducerProfile(producerId);

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Producer profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ο παραγωγός εγκρίθηκε επιτυχώς',
      profile: updatedProfile,
    });

  } catch (error) {
    console.error('Producer approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock helper functions
function getCurrentUser(token: string | null) {
  if (!token) return null;

  return {
    id: 99,
    name: 'Admin User',
    email: 'admin@dixis.test',
    role: 'admin' as const,
  };
}

async function approveProducerProfile(producerId: number) {
  // Mock database update
  // In real app: UPDATE producers SET status = 'active', updated_at = NOW() WHERE id = ?

  const mockProfiles: Record<number, any> = {
    1: {
      id: 1,
      user_id: 1,
      name: 'Δημήτρης Παπαδόπουλος',
      business_name: 'Παπαδόπουλος Αγρόκτημα',
      status: 'active',
      updated_at: new Date().toISOString(),
    },
    2: {
      id: 2,
      user_id: 2,
      name: 'Μαρία Γιαννοπούλου',
      status: 'active',
      updated_at: new Date().toISOString(),
    },
  };

  const profile = mockProfiles[producerId];
  if (profile) {
    profile.status = 'active';
    profile.updated_at = new Date().toISOString();
    console.log(`Mock: Approved producer ${producerId}`);
  }

  return profile || null;
}