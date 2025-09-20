import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/producers
 * Returns all producers for admin management
 */
export async function GET(request: NextRequest) {
  try {
    // Mock admin authentication check
    const userToken = request.headers.get('authorization');
    if (!userToken || !isAdminUser(userToken)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Mock producers data - in real app would fetch from database
    const producers = [
      {
        id: 1,
        name: 'Δημήτρης Παπαδόπουλος',
        business_name: 'Παπαδόπουλος Αγρόκτημα',
        email: 'dimitris@papadopoulos-farm.gr',
        phone: '+30 210 1234567',
        location: 'Κρήτη',
        status: 'active',
        created_at: '2025-09-10T10:00:00.000Z',
        updated_at: '2025-09-12T14:30:00.000Z',
      },
      {
        id: 2,
        name: 'Μαρία Γιαννοπούλου',
        business_name: 'Γιαννοπούλου Βιολογικά',
        email: 'maria@giannopoulou-organic.gr',
        phone: '+30 231 9876543',
        location: 'Θεσσαλονίκη',
        status: 'pending',
        created_at: '2025-09-14T09:15:00.000Z',
        updated_at: '2025-09-14T09:15:00.000Z',
      },
      {
        id: 3,
        name: 'Νίκος Κωνσταντίνου',
        business_name: 'Κωνσταντίνου Φάρμα',
        email: 'nikos@konstantinou-farm.gr',
        location: 'Πάτρα',
        status: 'pending',
        created_at: '2025-09-15T16:45:00.000Z',
        updated_at: '2025-09-15T16:45:00.000Z',
      },
      {
        id: 4,
        name: 'Ελένη Μιχαηλίδου',
        business_name: 'Μιχαηλίδου Ελαιώνες',
        email: 'eleni@michailidou-olives.gr',
        location: 'Καλαμάτα',
        status: 'rejected',
        created_at: '2025-09-08T11:20:00.000Z',
        updated_at: '2025-09-13T08:15:00.000Z',
      },
    ];

    return NextResponse.json({
      producers,
      total: producers.length,
      stats: {
        total: producers.length,
        active: producers.filter(p => p.status === 'active').length,
        pending: producers.filter(p => p.status === 'pending').length,
        rejected: producers.filter(p => p.status === 'rejected').length,
      },
    });

  } catch (error) {
    console.error('Admin producers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/producers
 * Updates producer status (approve/reject)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Mock admin authentication check
    const userToken = request.headers.get('authorization');
    if (!userToken || !isAdminUser(userToken)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { producerId, status } = body;

    if (!producerId || !status) {
      return NextResponse.json(
        { error: 'Producer ID and status are required' },
        { status: 400 }
      );
    }

    if (!['active', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active or rejected' },
        { status: 400 }
      );
    }

    // Mock status update - in real app would update database
    console.log(`Admin updated producer ${producerId} status to ${status}`);

    return NextResponse.json({
      success: true,
      message: `Producer status updated to ${status}`,
      producerId,
      status,
      updated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Producer status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock admin authentication helper
function isAdminUser(token: string): boolean {
  // In real app: verify JWT token and check admin role
  return token.includes('admin') || token === 'mock_admin_token';
}