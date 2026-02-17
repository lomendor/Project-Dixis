import { NextResponse } from 'next/server';

/**
 * GET /api/producer/status
 *
 * DISABLED: Producer status check is not yet implemented.
 * This route previously returned hardcoded mock data (always userId=1,
 * fake profile "Δημήτρης Παπαδόπουλος"), which masked the fact that
 * no real producer registration exists.
 *
 * Returns null status so the onboarding page shows the form
 * (which itself returns 503 on submit with an honest message).
 *
 * Producer registration is now wired to Laravel (PRODUCER-ONBOARD-01).
 * This stub remains for unauthenticated/pre-registration status checks.
 */
export async function GET() {
  return NextResponse.json({
    status: null,
    profile: null,
  });
}
