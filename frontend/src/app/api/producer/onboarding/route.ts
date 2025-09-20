import { NextRequest, NextResponse } from 'next/server';

interface OnboardingRequest {
  displayName: string;
  taxId?: string;
  phone?: string;
}

/**
 * POST /api/producer/onboarding
 * Creates or updates a producer profile with status=pending
 */
export async function POST(request: NextRequest) {
  try {
    const body: OnboardingRequest = await request.json();

    // Mock authentication
    const userToken = request.headers.get('authorization');
    const userId = getCurrentUserId(userToken);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required fields
    if (!body.displayName?.trim()) {
      return NextResponse.json(
        { error: 'Το όνομα εμφάνισης είναι υποχρεωτικό' },
        { status: 400 }
      );
    }

    // Mock producer profile creation/update
    const producerProfile = await createOrUpdateProducerProfile(userId, {
      displayName: body.displayName.trim(),
      taxId: body.taxId?.trim() || undefined,
      phone: body.phone?.trim() || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Η αίτηση υποβλήθηκε επιτυχώς',
      profile: producerProfile,
    });

  } catch (error) {
    console.error('Producer onboarding error:', error);
    return NextResponse.json(
      { error: 'Παρουσιάστηκε σφάλμα κατά την υποβολή' },
      { status: 500 }
    );
  }
}

// Mock helper functions
function getCurrentUserId(token: string | null): number | null {
  if (!token) return null;
  return 1; // Mock user ID for testing
}

async function createOrUpdateProducerProfile(
  userId: number,
  data: { displayName: string; taxId?: string; phone?: string }
) {
  // Mock database operation
  // In real app: use Prisma/ORM to create/update producer profile

  const now = new Date().toISOString();

  const profile = {
    id: Math.floor(Math.random() * 1000), // Mock ID
    user_id: userId,
    name: data.displayName,
    business_name: data.displayName, // Use display name as business name initially
    tax_id: data.taxId,
    phone: data.phone,
    status: 'pending' as const,
    slug: data.displayName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    is_active: false,
    verified: false,
    uses_custom_shipping_rates: false,
    created_at: now,
    updated_at: now,
  };

  // Mock: store to in-memory cache or localStorage in browser
  // In real app: INSERT or UPDATE into producers table
  console.log('Mock: Created/Updated producer profile:', profile);

  return profile;
}