/**
 * Pass PR-FIX-03: Analytics API client.
 *
 * Rewritten to use:
 * - /api/admin/analytics (Prisma-based, cookie auth)
 * - No more localStorage token or old Laravel /api/v1 endpoints
 */

export interface SalesData {
  date: string;
  total_sales: number;
  order_count: number;
  average_order_value: number;
}

export interface SalesAnalytics {
  period: 'daily' | 'monthly';
  data: SalesData[];
  summary: {
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
    period_growth: number;
  };
}

export interface OrdersAnalytics {
  by_status: Record<string, number>;
  by_payment_status: Record<string, number>;
  recent_orders: Array<{
    id: number;
    user_email: string;
    total_amount: number;
    status: string;
    payment_status: string;
    created_at: string;
  }>;
  summary: {
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    cancelled_orders: number;
  };
}

export interface TopProduct {
  id: number;
  name: string;
  price: number;
  total_quantity_sold: number;
  total_revenue: number;
  order_count: number;
}

export interface ProductsAnalytics {
  top_products: TopProduct[];
  summary: {
    total_products: number;
    active_products: number;
    out_of_stock: number;
    best_seller_id?: number;
    best_seller_name?: string;
  };
}

export interface TopProducer {
  id: number;
  name: string;
  location: string;
  product_count: number;
  total_revenue: number;
  order_count: number;
}

export interface ProducersAnalytics {
  active_producers: number;
  total_producers: number;
  top_producers: TopProducer[];
}

export interface DashboardSummary {
  today: {
    sales: number;
    orders: number;
    average_order_value: number;
  };
  month: {
    sales: number;
    orders: number;
    average_order_value: number;
    sales_growth: number;
    orders_growth: number;
  };
  totals: {
    users: number;
    producers: number;
    products: number;
    lifetime_revenue: number;
  };
}

// Cached response for all analytics (single API call)
let cachedData: any = null;
let cacheExpiry = 0;
const CACHE_TTL = 60_000; // 1 minute

async function fetchAll(): Promise<any> {
  if (cachedData && Date.now() < cacheExpiry) return cachedData;

  const res = await fetch('/api/admin/analytics', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Analytics API error: ${res.status}`);

  cachedData = await res.json();
  cacheExpiry = Date.now() + CACHE_TTL;
  return cachedData;
}

export const analyticsApi = {
  async getSales(_period: 'daily' | 'monthly' = 'daily', _limit = 30): Promise<SalesAnalytics> {
    const data = await fetchAll();
    return data.sales;
  },

  async getOrders(): Promise<OrdersAnalytics> {
    const data = await fetchAll();
    return data.orders;
  },

  async getProducts(_limit = 10): Promise<ProductsAnalytics> {
    const data = await fetchAll();
    return data.products;
  },

  async getProducers(): Promise<ProducersAnalytics> {
    const data = await fetchAll();
    return data.producers;
  },

  async getDashboard(): Promise<DashboardSummary> {
    const data = await fetchAll();
    return data.summary;
  },
};

/**
 * Format currency value for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

/**
 * Format percentage value for display
 */
export function formatPercentage(value: number): string {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

/**
 * Get status color for order status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
    case 'PENDING':
      return '#FFA500';
    case 'confirmed':
    case 'processing':
    case 'PACKING':
      return '#007BFF';
    case 'shipped':
    case 'SHIPPED':
      return '#17A2B8';
    case 'delivered':
    case 'DELIVERED':
      return '#28A745';
    case 'cancelled':
    case 'CANCELLED':
      return '#DC3545';
    default:
      return '#6C757D';
  }
}
