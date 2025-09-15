import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/orders
 * Returns all orders for admin overview with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Mock admin authentication check
    const userToken = request.headers.get('authorization');
    if (!userToken || !isAdminUser(userToken)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const dateRange = searchParams.get('dateRange') || 'all';
    const search = searchParams.get('search') || '';

    // Mock orders data - in real app would fetch from database
    const allOrders = [
      {
        id: 'ORDER-1726423800123',
        user_id: 1,
        status: 'delivered',
        total: 28.30,
        currency: 'EUR',
        items_count: 3,
        created_at: '2025-09-10T10:30:00.000Z',
        updated_at: '2025-09-14T16:45:00.000Z',
        customer: {
          name: 'Άννα Κωνσταντίνου',
          email: 'anna@example.com',
        },
        shipping_address: {
          name: 'Άννα Κωνσταντίνου',
          city: 'Αθήνα',
          postal_code: '10671',
        },
      },
      {
        id: 'ORDER-1726423900456',
        user_id: 2,
        status: 'shipped',
        total: 15.80,
        currency: 'EUR',
        items_count: 2,
        created_at: '2025-09-12T14:15:00.000Z',
        updated_at: '2025-09-15T09:30:00.000Z',
        customer: {
          name: 'Γιάννης Παπαδάκης',
          email: 'giannis@example.com',
        },
        shipping_address: {
          name: 'Γιάννης Παπαδάκης',
          city: 'Θεσσαλονίκη',
          postal_code: '54636',
        },
      },
      {
        id: 'ORDER-1726424000789',
        user_id: 3,
        status: 'processing',
        total: 42.50,
        currency: 'EUR',
        items_count: 5,
        created_at: '2025-09-14T11:20:00.000Z',
        updated_at: '2025-09-15T08:15:00.000Z',
        customer: {
          name: 'Μαρία Γεωργίου',
          email: 'maria@example.com',
        },
        shipping_address: {
          name: 'Μαρία Γεωργίου',
          city: 'Πάτρα',
          postal_code: '26221',
        },
      },
      {
        id: 'ORDER-1726424100012',
        user_id: 4,
        status: 'paid',
        total: 8.90,
        currency: 'EUR',
        items_count: 1,
        created_at: '2025-09-15T09:45:00.000Z',
        updated_at: '2025-09-15T09:45:00.000Z',
        customer: {
          name: 'Νίκος Σταμάτης',
          email: 'nikos@example.com',
        },
        shipping_address: {
          name: 'Νίκος Σταμάτης',
          city: 'Ηράκλειο',
          postal_code: '71201',
        },
      },
      {
        id: 'ORDER-1726424200345',
        user_id: 5,
        status: 'pending',
        total: 19.60,
        currency: 'EUR',
        items_count: 3,
        created_at: '2025-09-15T16:30:00.000Z',
        updated_at: '2025-09-15T16:30:00.000Z',
        customer: {
          name: 'Ελένη Δημητρίου',
          email: 'eleni@example.com',
        },
      },
      {
        id: 'DRAFT-1726424300678',
        user_id: 6,
        status: 'draft',
        total: 0,
        currency: 'EUR',
        items_count: 0,
        created_at: '2025-09-15T18:15:00.000Z',
        updated_at: '2025-09-15T18:15:00.000Z',
        customer: {
          name: 'Κώστας Μιχαήλ',
          email: 'kostas@example.com',
        },
      },
      {
        id: 'ORDER-1726424400901',
        user_id: 7,
        status: 'cancelled',
        total: 12.40,
        currency: 'EUR',
        items_count: 2,
        created_at: '2025-09-13T12:00:00.000Z',
        updated_at: '2025-09-14T10:20:00.000Z',
        customer: {
          name: 'Σοφία Αντωνίου',
          email: 'sofia@example.com',
        },
      },
    ];

    // Apply filters
    let filteredOrders = [...allOrders];

    // Status filter
    if (status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filteredOrders = filteredOrders.filter(order =>
        new Date(order.created_at) >= filterDate
      );
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = filteredOrders.filter(order =>
        order.id.toLowerCase().includes(searchLower) ||
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.email.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const total = filteredOrders.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    // Calculate stats
    const stats = {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === 'pending').length,
      processing: allOrders.filter(o => o.status === 'processing').length,
      shipped: allOrders.filter(o => o.status === 'shipped').length,
      delivered: allOrders.filter(o => o.status === 'delivered').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length,
      revenue: allOrders
        .filter(o => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status))
        .reduce((sum, o) => sum + o.total, 0),
    };

    return NextResponse.json({
      orders: paginatedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats,
    });

  } catch (error) {
    console.error('Admin orders error:', error);
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