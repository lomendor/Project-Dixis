import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/producer/status
 * Returns the current producer profile status for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Mock authentication - in real app this would come from session/JWT
    const userToken = request.headers.get('authorization');
    const userId = getCurrentUserId(userToken);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock producer profile lookup
    // In real app this would query the database
    const mockProducerProfile = getMockProducerProfile(userId);

    return NextResponse.json({
      status: mockProducerProfile?.status || null,
      profile: mockProducerProfile,
      submittedAt: mockProducerProfile?.created_at,
    });

  } catch (error) {
    console.error('Producer status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock helper functions (replace with actual database queries)
function getCurrentUserId(token: string | null): number | null {
  // Mock user extraction from token
  // In real app: verify JWT, extract user ID from session
  if (!token) return null;

  // For testing purposes, return mock user ID
  return 1;
}

function getMockProducerProfile(userId: number) {
  // Mock producer profiles for testing
  const mockProfiles: Record<number, any> = {
    1: {
      id: 1,
      user_id: userId,
      name: 'Δημήτρης Παπαδόπουλος',
      business_name: 'Παπαδόπουλος Αγρόκτημα',
      tax_id: '123456789',
      phone: '+30 210 1234567',
      status: 'pending', // Can be: 'pending' | 'active' | 'inactive'
      created_at: '2025-09-15T20:00:00.000Z',
      updated_at: '2025-09-15T20:00:00.000Z',
    },
    2: {
      id: 2,
      user_id: userId,
      name: 'Μαρία Γιαννοπούλου',
      status: 'active',
      created_at: '2025-09-14T15:30:00.000Z',
      updated_at: '2025-09-15T10:15:00.000Z',
    },
  };

  return mockProfiles[userId] || null;
}