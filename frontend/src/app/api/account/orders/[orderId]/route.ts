import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID παραγγελίας απαιτείται' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Απαιτείται πιστοποίηση' },
        { status: 401 }
      );
    }

    // Mock order details - in production this would query the database with ownership check
    const mockOrderDetails: Record<string, any> = {
      '1001': {
        id: 1001,
        status: 'delivered',
        total_amount: '45.50',
        subtotal: '42.50',
        tax_amount: '3.00',
        shipping_amount: '0.00',
        payment_method: 'Πιστωτική κάρτα',
        shipping_method: 'Παράδοση στο σπίτι',
        shipping_address: 'Λεωφ. Κηφισίας 123',
        city: 'Αθήνα',
        postal_code: '11523',
        notes: 'Παράδοση σε ώρες γραφείου',
        created_at: '2025-09-10T14:30:00Z',
        items: [
          {
            id: 2001,
            product_id: 101,
            product_name: 'Ελαιόλαδο Κρήτης',
            quantity: 2,
            unit_price: '15.75',
            total_price: '31.50',
            product_unit: 'λίτρο'
          },
          {
            id: 2002,
            product_id: 102,
            product_name: 'Μέλι Υμηττού',
            quantity: 1,
            unit_price: '14.00',
            total_price: '14.00',
            product_unit: 'κιλό'
          }
        ],
        statusTimeline: [
          {
            status: 'delivered',
            timestamp: '2025-09-12T11:45:00Z',
            description: 'Η παραγγελία παραδόθηκε επιτυχώς'
          },
          {
            status: 'shipped',
            timestamp: '2025-09-11T09:30:00Z',
            description: 'Η παραγγελία αποστάλθηκε'
          },
          {
            status: 'paid',
            timestamp: '2025-09-10T14:35:00Z',
            description: 'Η πληρωμή ολοκληρώθηκε'
          },
          {
            status: 'pending',
            timestamp: '2025-09-10T14:30:00Z',
            description: 'Η παραγγελία δημιουργήθηκε'
          }
        ]
      },
      '1002': {
        id: 1002,
        status: 'shipped',
        total_amount: '28.90',
        subtotal: '26.90',
        tax_amount: '2.00',
        shipping_amount: '0.00',
        payment_method: 'Τραπεζική εμβολή',
        shipping_method: 'Courier',
        city: 'Θεσσαλονίκη',
        postal_code: '54622',
        created_at: '2025-09-14T09:15:00Z',
        items: [
          {
            id: 2003,
            product_id: 103,
            product_name: 'Τυρί Φέτα',
            quantity: 3,
            unit_price: '8.97',
            total_price: '26.90',
            product_unit: 'κιλό'
          }
        ],
        statusTimeline: [
          {
            status: 'shipped',
            timestamp: '2025-09-15T08:20:00Z',
            description: 'Η παραγγελία αποστάλθηκε με ΕΛΤΑ Courier'
          },
          {
            status: 'paid',
            timestamp: '2025-09-14T10:00:00Z',
            description: 'Η πληρωμή επιβεβαιώθηκε'
          },
          {
            status: 'pending',
            timestamp: '2025-09-14T09:15:00Z',
            description: 'Η παραγγελία δημιουργήθηκε'
          }
        ]
      },
      '1003': {
        id: 1003,
        status: 'paid',
        total_amount: '67.20',
        subtotal: '62.20',
        tax_amount: '5.00',
        shipping_amount: '0.00',
        payment_method: 'PayPal',
        shipping_method: 'Παράδοση στο σπίτι',
        shipping_address: 'Πατησίων 45',
        city: 'Αθήνα',
        postal_code: '10433',
        created_at: '2025-09-15T16:45:00Z',
        items: [
          {
            id: 2004,
            product_id: 104,
            product_name: 'Ελιές Καλαμάτας',
            quantity: 2,
            unit_price: '12.50',
            total_price: '25.00',
            product_unit: 'κιλό'
          },
          {
            id: 2005,
            product_id: 105,
            product_name: 'Ντοματάκια Cherry',
            quantity: 4,
            unit_price: '7.50',
            total_price: '30.00',
            product_unit: 'κιλό'
          },
          {
            id: 2006,
            product_id: 106,
            product_name: 'Τραχανάς',
            quantity: 1,
            unit_price: '7.20',
            total_price: '7.20',
            product_unit: 'πακέτο'
          }
        ],
        statusTimeline: [
          {
            status: 'paid',
            timestamp: '2025-09-15T16:50:00Z',
            description: 'Η πληρωμή ολοκληρώθηκε μέσω PayPal'
          },
          {
            status: 'pending',
            timestamp: '2025-09-15T16:45:00Z',
            description: 'Η παραγγελία δημιουργήθηκε'
          }
        ]
      }
    };

    const orderDetails = mockOrderDetails[orderId];

    if (!orderDetails) {
      return NextResponse.json(
        { error: 'Η παραγγελία δεν βρέθηκε' },
        { status: 404 }
      );
    }

    // In production, verify that the order belongs to the authenticated user
    // For now, we'll simulate this with a simple check
    const token = authHeader.replace('Bearer ', '');

    // Mock ownership validation - in production this would check against the database
    if (token !== 'mock_consumer_token' && token !== 'admin_mock_token') {
      // Simulate unauthorized access to another user's order
      if (Math.random() < 0.1) { // 10% chance for testing
        return NextResponse.json(
          { error: 'Δεν έχετε δικαίωμα πρόσβασης σε αυτή την παραγγελία' },
          { status: 403 }
        );
      }
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json(orderDetails);

  } catch (error) {
    console.error('Σφάλμα ανάκτησης λεπτομερειών παραγγελίας:', error);
    return NextResponse.json(
      { error: 'Εσωτερικό σφάλμα διακομιστή' },
      { status: 500 }
    );
  }
}