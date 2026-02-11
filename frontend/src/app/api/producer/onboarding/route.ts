import { NextResponse } from 'next/server';

/**
 * POST /api/producer/onboarding
 *
 * DISABLED: Producer onboarding is not yet implemented.
 * This route previously returned mock data (always userId=1, no DB write),
 * which misled users into thinking registration succeeded.
 *
 * TODO: Wire to Laravel producer registration API when backend is ready.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Η εγγραφή παραγωγών δεν είναι διαθέσιμη αυτή τη στιγμή. Επικοινωνήστε μαζί μας στο info@dixis.gr.',
    },
    { status: 503 }
  );
}
