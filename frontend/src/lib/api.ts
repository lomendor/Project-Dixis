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
  shipping_cost?: number;
  shipping_carrier?: string;
  shipping_eta_days?: number;
  postal_code?: string;
  city?: string;
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

export interface ProducerOrder {
  id: number;
  user_id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  payment_status: string;
  payment_method: string;
  subtotal: string;
  shipping_cost: string;
  total: string;
  currency: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
}

export interface ProducerOrdersResponse {
  success: boolean;
  orders: ProducerOrder[];
  meta: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'consumer' | 'producer' | 'admin';
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ShippingQuote {
  carrier: string;
  cost: number;
  etaDays: number;
  zone: string;
  details?: {
    zip: string;
    city: string;
    weight: number;
    volume: number;
  };
}

export interface ShippingQuoteRequest {
  zip: string;
  city: string;
  weight: number;
  volume: number;
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

// Helper functions for safe URL joining
const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8001/api/v1';

// Enhanced URL trimming that handles multiple slashes and edge cases
const trimBoth = (s: string) => {
  if (!s || typeof s !== 'string') return '';
  
  // Handle protocol URLs specially (preserve :// in protocols)
  if (s.includes('://')) {
    const [protocol, rest] = s.split('://');
    if (!protocol || !rest) {
      throw new Error(`Invalid URL format: ${s}`);
    }
    const cleanRest = rest.replace(/\/+$/,'').replace(/^\/+/,'').replace(/\/+/g, '/');
    return `${protocol}://${cleanRest}`;
  }
  
  // For non-protocol strings, remove leading and trailing slashes, collapse multiple slashes
  return s.replace(/\/+$/,'').replace(/^\/+/,'').replace(/\/+/g, '/');
};

const BASE = trimBoth(RAW_BASE);

// Safe URL joining with validation and normalization
export const apiUrl = (path: string) => {
  if (!path || typeof path !== 'string') return BASE;
  
  const cleanPath = trimBoth(path);
  if (!cleanPath) return BASE;
  
  // Handle absolute URLs passed as path
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }
  
  // Safe join with single slash
  return `${BASE}/${cleanPath}`;
};

// Legacy functions for compatibility
function trimSlashes(s: string): string {
  return s.replace(/\/+$/,'').replace(/^\/+/,'');
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8001/api/v1';
    this.baseURL = trimBoth(rawBase);
    
    // Load token from localStorage if available
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  refreshToken(): void {
    this.loadTokenFromStorage();
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
    // Handle absolute URLs directly - use new safe URL joining
    const url = endpoint.startsWith('http') ? endpoint : apiUrl(endpoint);
    
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
    const endpoint = `public/products${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{
      current_page: number;
      data: Product[];
      first_page_url: string;
      from: number;
      last_page: number;
      last_page_url: string;
      links: Array<{url: string | null; label: string; active: boolean}>;
      next_page_url: string | null;
      path: string;
      per_page: number;
      prev_page_url: string | null;
      to: number;
      total: number;
    }>(endpoint);
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`public/products/${id}`);
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('auth/login', {
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
    role: 'consumer' | 'producer' | 'admin';
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    await this.request('auth/logout', {
      method: 'POST',
    });
    this.setToken(null);
  }

  async getProfile(): Promise<User> {
    return this.request<User>('auth/profile');
  }

  // Cart methods
  async getCart(): Promise<CartResponse> {
    const response = await this.request<{cart_items: CartItem[], total_items: number, total_amount: string}>('cart/items');
    return {
      items: response.cart_items || [],
      total_items: response.total_items,
      total_amount: response.total_amount
    };
  }

  async addToCart(productId: number, quantity: number): Promise<{ cart_item: CartItem }> {
    return this.request<{ cart_item: CartItem }>('cart/items', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity,
      }),
    });
  }

  async updateCartItem(cartItemId: number, quantity: number): Promise<{ cart_item: CartItem }> {
    return this.request<{ cart_item: CartItem }>(`cart/items/${cartItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(cartItemId: number): Promise<void> {
    return this.request(`cart/items/${cartItemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<void> {
    return this.request('cart/clear', {
      method: 'DELETE',
    });
  }

  // Shipping methods
  async getShippingQuote(data: ShippingQuoteRequest): Promise<ShippingQuote> {
    return this.request<ShippingQuote>('shipping/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Order methods
  async checkout(data: {
    payment_method?: string;
    shipping_method?: 'HOME' | 'PICKUP' | 'COURIER';
    shipping_address?: string;
    shipping_cost?: number;
    shipping_carrier?: string;
    shipping_eta_days?: number;
    postal_code?: string;
    city?: string;
    notes?: string;
  }): Promise<Order> {
    const response = await this.request<{ order: Order }>('orders/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.order;
  }

  async getOrders(): Promise<{ orders: Order[] }> {
    return this.request<{ orders: Order[] }>('orders');
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`orders/${id}`);
  }

  // Direct order creation (new V1 API)
  async createOrder(data: {
    items: { product_id: number; quantity: number }[];
    currency: 'EUR' | 'USD';
    shipping_method: 'HOME' | 'PICKUP';
    notes?: string;
  }): Promise<Order> {
    return this.request<Order>('orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Producer methods
  async getProducerKpi(): Promise<ProducerKpi> {
    return this.request<ProducerKpi>('producer/dashboard/kpi');
  }

  async getProducerStats(): Promise<ProducerStats> {
    return this.request<ProducerStats>('producer/dashboard/stats');
  }

  async getProducerTopProducts(limit?: number): Promise<{ data: Product[] }> {
    const endpoint = `producer/dashboard/top-products${limit ? `?limit=${limit}` : ''}`;
    return this.request<{ data: Product[] }>(endpoint);
  }

  async getTopProducts(limit?: number): Promise<{ top_products: TopProduct[] }> {
    const endpoint = `producer/dashboard/top-products${limit ? `?limit=${limit}` : ''}`;
    return this.request<{ top_products: TopProduct[] }>(endpoint);
  }

  // Producer product management methods
  async getProducerProducts(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'all';
  }): Promise<{
    data: Product[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more: boolean;
  }> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `producer/products${queryString ? `?${queryString}` : ''}`;

    return this.request<{
      data: Product[];
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      has_more: boolean;
    }>(endpoint);
  }

  async updateProductStock(productId: number, stock: number): Promise<{
    id: number;
    name: string;
    old_stock: number | null;
    new_stock: number;
    message: string;
  }> {
    return this.request<{
      id: number;
      name: string;
      old_stock: number | null;
      new_stock: number;
      message: string;
    }>(`producer/products/${productId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
  }

  // Producer order management methods
  async getProducerOrders(status?: 'pending' | 'processing' | 'shipped' | 'delivered'): Promise<ProducerOrdersResponse> {
    const endpoint = `producer/orders${status ? `?status=${status}` : ''}`;
    return this.request<ProducerOrdersResponse>(endpoint);
  }

  async getProducerOrder(orderId: number): Promise<{ success: boolean; order: ProducerOrder }> {
    return this.request<{ success: boolean; order: ProducerOrder }>(`producer/orders/${orderId}`);
  }

  async updateProducerOrderStatus(
    orderId: number,
    status: 'processing' | 'shipped' | 'delivered'
  ): Promise<{ success: boolean; message: string; order: ProducerOrder }> {
    return this.request<{ success: boolean; message: string; order: ProducerOrder }>(
      `producer/orders/${orderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  }
}

export const apiClient = new ApiClient();

// Helper function for public products
export async function getPublicProducts() {
  const res = await fetch(apiUrl('public/products'), { cache: 'no-store' });
  if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
  return res.json();
}