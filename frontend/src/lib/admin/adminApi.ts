// Admin API utilities for dashboard functionality
import { apiClient, User, Product, Order } from '@/lib/api';

export interface ProducerWithStatus extends User {
  status: 'pending' | 'approved' | 'rejected';
  products_count: number;
  total_orders: number;
  total_revenue: string;
  business_name?: string;
  location?: string;
  phone?: string;
}

export interface ProductWithProducer {
  id: number;
  name: string;
  price: string;
  unit: string;
  stock: number | null;
  is_active: boolean;
  description: string | null;
  categories?: Array<{ id: number; name: string; slug: string; }>;
  images?: Array<{ id: number; url: string; image_path?: string; alt_text?: string; is_primary: boolean; }>;
  producer: ProducerWithStatus;
}

export interface AdminStats {
  total_producers: number;
  active_producers: number;
  pending_producers: number;
  total_products: number;
  active_products: number;
  total_orders: number;
  total_revenue: string;
  recent_activities: AdminActivity[];
}

export interface AdminActivity {
  id: number;
  type: 'producer_registered' | 'producer_approved' | 'product_created' | 'order_completed';
  description: string;
  user_name: string;
  created_at: string;
}

export class AdminApiClient {
  // Producer management
  async getProducers(): Promise<ProducerWithStatus[]> {
    try {
      const response = await apiClient['request']<{ producers: ProducerWithStatus[] }>('admin/producers');
      return response.producers || [];
    } catch (error) {
      console.error('Failed to fetch producers:', error);
      throw error;
    }
  }

  async updateProducerStatus(producerId: number, status: 'approved' | 'rejected'): Promise<ProducerWithStatus> {
    try {
      const response = await apiClient['request']<{ producer: ProducerWithStatus }>(`admin/producers/${producerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      return response.producer;
    } catch (error) {
      console.error('Failed to update producer status:', error);
      throw error;
    }
  }

  // Product management  
  async getProducts(): Promise<ProductWithProducer[]> {
    try {
      const response = await apiClient['request']<{ products: ProductWithProducer[] }>('admin/products');
      return response.products || [];
    } catch (error) {
      console.error('Failed to fetch admin products:', error);
      throw error;
    }
  }

  async toggleProductStatus(productId: number, isActive: boolean): Promise<ProductWithProducer> {
    try {
      const response = await apiClient['request']<{ product: ProductWithProducer }>(`admin/products/${productId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive })
      });
      return response.product;
    } catch (error) {
      console.error('Failed to toggle product status:', error);
      throw error;
    }
  }

  // Analytics and stats
  async getStats(): Promise<AdminStats> {
    try {
      const response = await apiClient['request']<AdminStats>('admin/stats');
      return response;
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      throw error;
    }
  }

  // Get all orders for admin overview
  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await apiClient['request']<{ orders: Order[] }>('admin/orders');
      return response.orders || [];
    } catch (error) {
      console.error('Failed to fetch admin orders:', error);
      throw error;
    }
  }
}

export const adminApi = new AdminApiClient();

// Helper functions for data formatting
export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(numAmount);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('el-GR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

export const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} λεπτά πριν`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ${hours === 1 ? 'ώρα' : 'ώρες'} πριν`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} ${days === 1 ? 'μέρα' : 'μέρες'} πριν`;
  }
};