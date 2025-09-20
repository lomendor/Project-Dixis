import { NextRequest, NextResponse } from 'next/server';
import { getShippingQuoteAsync, validateGreekPostalCode } from '@/lib/shipping-estimator';

/**
 * POST /api/checkout/quote
 * Returns shipping quote for given weight and postal code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { totalWeightGrams, postalCode } = body;

    // Validate required fields
    if (!totalWeightGrams || typeof totalWeightGrams !== 'number') {
      return NextResponse.json(
        { error: 'Το συνολικό βάρος είναι υποχρεωτικό και πρέπει να είναι αριθμός' },
        { status: 400 }
      );
    }

    if (!postalCode || typeof postalCode !== 'string') {
      return NextResponse.json(
        { error: 'Ο ταχυδρομικός κώδικας είναι υποχρεωτικός' },
        { status: 400 }
      );
    }

    // Validate weight range
    if (totalWeightGrams <= 0) {
      return NextResponse.json(
        { error: 'Το βάρος πρέπει να είναι μεγαλύτερο από 0' },
        { status: 400 }
      );
    }

    if (totalWeightGrams > 50000) { // 50kg limit
      return NextResponse.json(
        { error: 'Το μέγιστο βάρος για αποστολή είναι 50kg' },
        { status: 400 }
      );
    }

    // Validate postal code format
    if (!validateGreekPostalCode(postalCode)) {
      return NextResponse.json(
        { error: 'Μη έγκυρος ταχυδρομικός κώδικας. Παρακαλώ εισάγετε 5-ψήφιο κώδικα' },
        { status: 400 }
      );
    }

    // Get shipping quote
    const quote = await getShippingQuoteAsync(totalWeightGrams, postalCode);

    return NextResponse.json(quote);

  } catch (error) {
    console.error('Shipping quote error:', error);

    // Handle specific shipping calculation errors
    if (error instanceof Error && error.message.includes('postal code')) {
      return NextResponse.json(
        { error: 'Μη έγκυρος ταχυδρομικός κώδικας' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Σφάλμα κατά τον υπολογισμό των εξόδων αποστολής' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/checkout/quote
 * Returns available shipping regions for reference
 */
export async function GET() {
  try {
    const { getShippingRegions } = await import('@/lib/shipping-estimator');
    const regions = getShippingRegions();

    return NextResponse.json({
      regions,
      info: {
        weightLimits: {
          minimum: 1, // 1 gram
          maximum: 50000, // 50kg
        },
        postalCodeFormat: {
          pattern: '^[0-9]{5}$',
          example: '12345',
        },
        estimatedDelivery: {
          athens: '2 ημέρες',
          thessaloniki: '2 ημέρες',
          majorCities: '3 ημέρες',
          remoteAreas: '3 ημέρες',
          islands: '4 ημέρες',
        },
      },
    });
  } catch (error) {
    console.error('Shipping regions error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά τη φόρτωση πληροφοριών αποστολής' },
      { status: 500 }
    );
  }
}