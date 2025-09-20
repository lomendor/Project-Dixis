import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/checkout/address
 * Saves shipping address for the current draft order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, line1, city, postalCode, country, phone } = body;

    // Mock authentication - in real app, get user from token
    const userToken = request.headers.get('authorization');
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required fields
    const validationErrors: string[] = [];

    if (!name?.trim()) {
      validationErrors.push('Το όνομα είναι υποχρεωτικό');
    }

    if (!line1?.trim()) {
      validationErrors.push('Η διεύθυνση είναι υποχρεωτική');
    }

    if (!city?.trim()) {
      validationErrors.push('Η πόλη είναι υποχρεωτική');
    }

    if (!postalCode?.trim()) {
      validationErrors.push('Ο ταχυδρομικός κώδικας είναι υποχρεωτικός');
    } else if (!/^[0-9]{5}$/.test(postalCode.trim())) {
      validationErrors.push('Μη έγκυρος ταχυδρομικός κώδικας (απαιτούνται 5 ψηφία)');
    }

    if (country && country !== 'GR') {
      validationErrors.push('Αυτή τη στιγμή υποστηρίζουμε μόνο αποστολές στην Ελλάδα');
    }

    // Validate phone format if provided
    if (phone && phone.trim()) {
      const phoneRegex = /^(\+30)?\s?[0-9\s-]{10,}$/;
      if (!phoneRegex.test(phone.trim())) {
        validationErrors.push('Μη έγκυρος αριθμός τηλεφώνου');
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Σφάλματα επικύρωσης', errors: validationErrors },
        { status: 400 }
      );
    }

    // Mock: Save address to draft order
    // In real app: Update Order.shipping_address where status = 'draft'
    const savedAddress = {
      id: `addr_${Date.now()}`,
      name: name.trim(),
      line1: line1.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      country: country || 'GR',
      phone: phone?.trim() || null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      address: savedAddress,
      message: 'Η διεύθυνση αποστολής αποθηκεύτηκε επιτυχώς',
    });

  } catch (error) {
    console.error('Address save error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά την αποθήκευση της διεύθυνσης' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/checkout/address
 * Returns the current draft order's shipping address
 */
export async function GET(request: NextRequest) {
  try {
    // Mock authentication
    const userToken = request.headers.get('authorization');
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock: Get current draft order's address
    // In real app: SELECT shipping_address FROM orders WHERE user_id = ? AND status = 'draft'
    const mockAddress = {
      id: 'addr_mock',
      name: '',
      line1: '',
      city: '',
      postalCode: '',
      country: 'GR',
      phone: '',
    };

    return NextResponse.json({
      address: mockAddress,
    });

  } catch (error) {
    console.error('Address fetch error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά τη φόρτωση της διεύθυνσης' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/checkout/address
 * Updates the shipping address for the current draft order
 */
export async function PUT(request: NextRequest) {
  // For simplicity, just use the same logic as POST
  return POST(request);
}