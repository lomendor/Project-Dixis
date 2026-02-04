import { API_BASE_URL } from '@/env';

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

export const analyticsApi = {
  /**
   * Get sales analytics data
   */
  async getSales(period: 'daily' | 'monthly' = 'daily', limit = 30): Promise<SalesAnalytics> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams({
      period,
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/admin/analytics/sales?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analytics;
  },

  /**
   * Get orders analytics data
   */
  async getOrders(): Promise<OrdersAnalytics> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/analytics/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analytics;
  },

  /**
   * Get products analytics data
   */
  async getProducts(limit = 10): Promise<ProductsAnalytics> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/admin/analytics/products?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analytics;
  },

  /**
   * Get producers analytics data
   */
  async getProducers(): Promise<ProducersAnalytics> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/analytics/producers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analytics;
  },

  /**
   * Get dashboard summary with all key metrics
   */
  async getDashboard(): Promise<DashboardSummary> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/analytics/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
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
      return '#FFA500'; // Orange
    case 'confirmed':
    case 'processing':
      return '#007BFF'; // Blue
    case 'shipped':
      return '#17A2B8'; // Cyan
    case 'delivered':
      return '#28A745'; // Green
    case 'cancelled':
      return '#DC3545'; // Red
    default:
      return '#6C757D'; // Gray
  }
}