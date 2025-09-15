import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/producers
 * Returns list of all producer applications for admin review
 */
export async function GET(request: NextRequest) {
  try {
    // Mock authentication and admin role check
    const userToken = request.headers.get('authorization');
    const user = getCurrentUser(userToken);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock producer applications from database
    const producers = await getAllProducerApplications();

    return NextResponse.json({
      producers,
      total: producers.length,
    });

  } catch (error) {
    console.error('Admin producers list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock helper functions
function getCurrentUser(token: string | null) {
  if (!token) return null;

  // Mock admin user for testing
  return {
    id: 99,
    name: 'Admin User',
    email: 'admin@dixis.test',
    role: 'admin' as const,
  };
}

async function getAllProducerApplications() {
  // Mock producer applications
  // In real app: SELECT from producers table with user JOIN
  const mockApplications = [
    {
      id: 1,
      userId: 1,
      userEmail: 'dimitris@producer.test',
      displayName: 'Δημήτρης Παπαδόπουλος',
      taxId: '123456789',
      phone: '+30 210 1234567',
      status: 'pending' as const,
      submittedAt: '2025-09-15T20:00:00.000Z',
      updatedAt: '2025-09-15T20:00:00.000Z',
    },
    {
      id: 2,
      userId: 2,
      userEmail: 'maria@producer.test',
      displayName: 'Μαρία Γιαννοπούλου',
      taxId: '987654321',
      phone: '+30 210 9876543',
      status: 'active' as const,
      submittedAt: '2025-09-14T15:30:00.000Z',
      updatedAt: '2025-09-15T10:15:00.000Z',
    },
    {
      id: 3,
      userId: 3,
      userEmail: 'kostas@producer.test',
      displayName: 'Κώστας Αντωνίου',
      taxId: '',
      phone: '',
      status: 'inactive' as const,
      submittedAt: '2025-09-13T09:45:00.000Z',
      updatedAt: '2025-09-14T14:20:00.000Z',
    },
  ];

  return mockApplications;
}