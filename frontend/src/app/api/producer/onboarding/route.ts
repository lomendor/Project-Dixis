import { NextResponse } from 'next/server';

/**
 * POST /api/producer/onboarding
 *
 * DISABLED: Producer onboarding is not yet implemented.
 * This route previously returned mock data (always userId=1, no DB write),
 * which misled users into thinking registration succeeded.
 *
 * Producer registration is now handled via Laravel API (PRODUCER-ONBOARD-01).
 * This legacy stub returns 503 for any remaining direct hits.
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
