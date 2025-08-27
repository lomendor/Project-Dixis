// API client utility with Bearer token support

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  unit: string;
  stock: number | null;
  is_active: boolean;
  description: string | null;
  categories: Category[];
  images: ProductImage[];
  producer: Producer;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: number;
  url: string;
  image_path?: string; // fallback for compatibility
  alt_text?: string;
  is_primary: boolean;
}

export interface Producer {
  id: number;
  name: string;
  business_name: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface CartItem {
  id: number;
  quantity: number;
  product: Product;
  subtotal: string;
}

export interface CartResponse {
  items: CartItem[];
  total_items: number;
  total_amount: string;
}

export interface Order {
  id: number;
  user_id: number;
  subtotal: string;
  tax_amount: string;
  shipping_amount: string;
  total_amount: string;
  payment_status: string;
  payment_method: string;
  status: string;
  shipping_method: string;
  shipping_address?: string;
  notes?: string;
  created_at: string;
  items: OrderItem[];
  order_items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: string;
  unit_price: string;
  total_price: string;
  product_name: string;
  product_unit: string;
  product: Product;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'consumer' | 'producer';
  address?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ProducerKpi {
  total_products: number;
  active_products: number;
  total_orders: number;
  revenue: string;
  unread_messages: number;
}

export interface ProducerStats {
  total_orders: number;
  total_revenue: string;
  active_products: number;
  average_order_value: string;
}

export interface TopProduct {
  id: number;
  name: string;
  current_price: string;
  total_quantity_sold: number;
  total_revenue: string;
  total_orders: number;
  average_unit_price: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001';
    
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Public API methods
  async getProducts(params?: {
    search?: string;
    category?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/api/v1/public/products${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{
      data: Product[];
      links: Record<string, unknown>;
      meta: Record<string, unknown>;
    }>(endpoint);
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/api/v1/public/products/${id}`);
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'consumer' | 'producer';
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/api/v1/auth/logout', {
      method: 'POST',
    });
    this.setToken(null);
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/api/v1/auth/profile');
  }

  // Cart methods
  async getCart(): Promise<CartResponse> {
    return this.request<CartResponse>('/api/v1/cart/items');
  }

  async addToCart(productId: number, quantity: number): Promise<{ cart_item: CartItem }> {
    return this.request<{ cart_item: CartItem }>('/api/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity,
      }),
    });
  }

  async updateCartItem(cartItemId: number, quantity: number): Promise<{ cart_item: CartItem }> {
    return this.request<{ cart_item: CartItem }>(`/api/v1/cart/items/${cartItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(cartItemId: number): Promise<void> {
    return this.request(`/api/v1/cart/items/${cartItemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<void> {
    return this.request('/api/v1/cart/clear', {
      method: 'DELETE',
    });
  }

  // Order methods
  async checkout(data: {
    payment_method?: string;
    shipping_method?: 'HOME' | 'PICKUP' | 'COURIER';
    shipping_address?: string;
    notes?: string;
  }): Promise<Order> {
    const response = await this.request<{ order: Order }>('/api/v1/my/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.order;
  }

  async getOrders(): Promise<{ orders: Order[] }> {
    return this.request<{ orders: Order[] }>('/api/v1/my/orders');
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/api/v1/my/orders/${id}`);
  }

  // Direct order creation (new V1 API)
  async createOrder(data: {
    items: { product_id: number; quantity: number }[];
    currency: 'EUR' | 'USD';
    shipping_method: 'HOME' | 'PICKUP';
    notes?: string;
  }): Promise<Order> {
    return this.request<Order>('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Producer methods
  async getProducerKpi(): Promise<ProducerKpi> {
    return this.request<ProducerKpi>('/api/v1/producer/dashboard/kpi');
  }

  async getProducerStats(): Promise<ProducerStats> {
    return this.request<ProducerStats>('/api/v1/producer/dashboard/stats');
  }

  async getProducerTopProducts(limit?: number): Promise<{ data: Product[] }> {
    const endpoint = `/api/v1/producer/dashboard/top-products${limit ? `?limit=${limit}` : ''}`;
    return this.request<{ data: Product[] }>(endpoint);
  }

  async getTopProducts(limit?: number): Promise<{ top_products: TopProduct[] }> {
    const endpoint = `/api/v1/producer/dashboard/top-products${limit ? `?limit=${limit}` : ''}`;
    return this.request<{ top_products: TopProduct[] }>(endpoint);
  }
}

export const apiClient = new ApiClient();