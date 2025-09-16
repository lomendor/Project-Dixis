import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Απαιτείται πιστοποίηση' },
        { status: 401 }
      );
    }

    // Extract pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');

    // Mock user orders data - in production this would query the database
    const mockOrders = [
      {
        id: 1001,
        status: 'delivered',
        total_amount: '45.50',
        created_at: '2025-09-10T14:30:00Z',
        items: [
          {
            id: 2001,
            product_name: 'Ελαιόλαδο Κρήτης',
            quantity: 2,
            price: '15.75'
          },
          {
            id: 2002,
            product_name: 'Μέλι Υμηττού',
            quantity: 1,
            price: '14.00'
          }
        ]
      },
      {
        id: 1002,
        status: 'shipped',
        total_amount: '28.90',
        created_at: '2025-09-14T09:15:00Z',
        items: [
          {
            id: 2003,
            product_name: 'Τυρί Φέτα',
            quantity: 3,
            price: '9.63'
          }
        ]
      },
      {
        id: 1003,
        status: 'paid',
        total_amount: '67.20',
        created_at: '2025-09-15T16:45:00Z',
        items: [
          {
            id: 2004,
            product_name: 'Ελιές Καλαμάτας',
            quantity: 2,
            price: '12.50'
          },
          {
            id: 2005,
            product_name: 'Ντοματάκια Cherry',
            quantity: 4,
            price: '8.75'
          },
          {
            id: 2006,
            product_name: 'Τραχανάς',
            quantity: 1,
            price: '7.45'
          }
        ]
      }
    ];

    // Calculate pagination
    const totalOrders = mockOrders.length;
    const totalPages = Math.ceil(totalOrders / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    const paginatedOrders = mockOrders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(startIndex, endIndex);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      orders: paginatedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        perPage
      }
    });

  } catch (error) {
    console.error('Σφάλμα ανάκτησης παραγγελιών:', error);
    return NextResponse.json(
      { error: 'Εσωτερικό σφάλμα διακομιστή' },
      { status: 500 }
    );
  }
}