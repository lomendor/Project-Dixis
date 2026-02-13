// API client utility with Bearer token support
// NOTE: URL resolution delegates to @/env (SSOT). Do NOT add new process.env reads here.

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}

export interface Product {
  id: number;
  name: string;
  slug?: string;
  price: string;
  current_price?: string; // Pass FIX-DASHBOARD-THUMBNAILS-01: top-products API returns current_price
  unit: string;
  stock: number | null;
  is_active: boolean;
  description: string | null;
  category?: string;
  image_url?: string | null;
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

export interface ShippingAddress {
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postal_code?: string;
  region?: string;
  country?: string;
}

// Pass MP-MULTI-PRODUCER-CHECKOUT-02: Per-producer shipping breakdown
export interface ShippingLine {
  producer_id: number;
  producer_name: string;
  subtotal: string;
  shipping_cost: string;
  shipping_method: string;
  free_shipping_applied: boolean;
}

export interface OrderItemProducer {
  id: number;
  name: string;
  slug?: string;
}

export interface Order {
  id: number;
  user_id: number;
  // Pass TRACKING-DISPLAY-01: Public token for customer tracking
  public_token?: string;
  subtotal: string;
  tax_amount: string;
  shipping_amount: string;
  cod_fee?: string; // Pass COD-FEE-FIX-01: COD surcharge
  total_amount: string;
  payment_status: string;
  payment_method: string;
  payment_provider?: string; // Pass 51: stripe, null for COD
  payment_reference?: string; // Pass 51: external session/transaction ID
  status: string;
  shipping_method: string;
  shipping_method_label?: string; // Human-readable label (Greek)
  shipping_address?: ShippingAddress | string; // Object or legacy string
  shipping_cost?: number;
  shipping_carrier?: string;
  shipping_eta_days?: number;
  postal_code?: string;
  city?: string;
  notes?: string;
  created_at: string;
  items: OrderItem[];
  order_items: OrderItem[];
  // Pass MP-MULTI-PRODUCER-CHECKOUT-02: Multi-producer shipping breakdown
  shipping_total?: string; // Sum of shipping_lines when order has multiple producers
  shipping_lines?: ShippingLine[]; // Per-producer shipping breakdown
  is_multi_producer?: boolean; // True when order spans 2+ producers
  // Pass PAYMENT-INIT-ORDER-ID-01: Multi-producer checkout session support
  type?: 'checkout_session'; // Present for multi-producer orders
  payment_order_id?: number; // Canonical order ID for payment init (first child order)
  orders?: Order[]; // Child orders for multi-producer checkout
}

// Pass TRACKING-DISPLAY-01: Public order tracking response
export interface OrderTrackingResponse {
  ok: boolean;
  order: {
    id: number;
    status: string;
    payment_status: string;
    created_at: string;
    updated_at: string;
    items_count: number;
    total: number;
    shipment?: {
      status: string;
      carrier_code: string | null;
      tracking_code: string | null;
      tracking_url: string | null;
      shipped_at: string | null;
      delivered_at: string | null;
      estimated_delivery: string | null;
    };
  };
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
  producer?: OrderItemProducer; // Producer info for marketplace grouping
}

// Raw API response may use snake_case (order_items) or camelCase (orderItems)
export interface ProducerOrderRaw {
  id: number;
  user_id: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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
  orderItems?: OrderItem[];
  order_items?: OrderItem[];
}

// Normalized type always has orderItems (camelCase)
export interface ProducerOrder {
  id: number;
  user_id: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    [key: string]: number; // Allow dynamic status access
  };
}

// Pass 61: Admin orders response
export interface AdminOrder {
  id: number;
  user_id: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: string;
  subtotal: string;
  tax_amount: string;
  shipping_amount: string;
  total_amount: string;
  shipping_method: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  order_items?: OrderItem[];
}

export interface AdminOrdersResponse {
  success: boolean;
  orders: AdminOrder[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: Record<string, number>;
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
// CRITICAL: Browser must use relative URLs (same-origin) to avoid localhost in production
// Server-side can use INTERNAL_API_URL for SSR server-to-server calls
//
// SSOT: Delegates to @/env for URL resolution. Do NOT duplicate logic here.
import { API_BASE_URL as _envApiBase } from '@/env';

export function getApiBaseUrl(): string {
  return _envApiBase;
}

const RAW_BASE = getApiBaseUrl();

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
  if (!path || typeof path !== 'string') return `/${BASE}`;

  const cleanPath = trimBoth(path);
  if (!cleanPath) return `/${BASE}`;

  // Handle absolute URLs passed as path
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // If BASE is a full URL (has ://), join normally
  if (BASE.includes('://')) {
    return `${BASE}/${cleanPath}`;
  }

  // For relative paths, ALWAYS prepend / to make it absolute from root
  // This ensures /api/v1/auth/login instead of api/v1/auth/login
  return `/${BASE}/${cleanPath}`.replace(/\/+/g, '/');
};

// Legacy functions for compatibility
function trimSlashes(s: string): string {
  return s.replace(/\/+$/,'').replace(/^\/+/,'');
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    // Use centralized getApiBaseUrl() - no localhost fallback
    const rawBase = getApiBaseUrl();
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
    // DEBUG: Token instrumentation (masked for security) - enable with NEXT_PUBLIC_DEBUG_AUTH=1
    const DEBUG_AUTH = typeof window !== 'undefined' &&
      (process.env.NEXT_PUBLIC_DEBUG_AUTH === '1' || localStorage.getItem('DEBUG_AUTH') === '1');

    const maskToken = (t: string | null | undefined) =>
      t ? `${t.slice(0, 6)}...${t.slice(-4)}` : 'null';

    if (DEBUG_AUTH && token && typeof window !== 'undefined') {
      const parts = token.split('|');
      console.log('🔐 [setToken] BEFORE save:', {
        masked: maskToken(token),
        totalLen: token.length,
        plainLen: parts[1]?.length,
      });
    }

    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);

        if (DEBUG_AUTH) {
          const saved = localStorage.getItem('auth_token');
          const savedParts = saved?.split('|');
          console.log('🔐 [setToken] AFTER save:', {
            masked: maskToken(saved),
            totalLen: saved?.length,
            plainLen: savedParts?.[1]?.length,
            MATCH: saved === token ? '✅ YES' : '❌ NO - TRUNCATION',
          });
        }
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
      credentials: 'include', // Required for Sanctum session cookies (AUTH-CRED-01)
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

    // DEBUG: Token instrumentation (masked) - enable with DEBUG_AUTH=1 in localStorage
    if (response.token) {
      const DEBUG_AUTH = typeof window !== 'undefined' &&
        (process.env.NEXT_PUBLIC_DEBUG_AUTH === '1' || localStorage.getItem('DEBUG_AUTH') === '1');

      if (DEBUG_AUTH) {
        const parts = response.token.split('|');
        const masked = `${response.token.slice(0, 6)}...${response.token.slice(-4)}`;
        console.log('🔐 [login] API RESPONSE:', {
          masked,
          totalLen: response.token.length,
          idPart: parts[0],
          plainLen: parts[1]?.length,
        });
      }
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
    // Backend returns { user: {...} }, we need to unwrap it
    const response = await this.request<{ user: User }>('auth/profile');
    return response.user;
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

  // Pass CART-SYNC-01: Sync localStorage cart with server on login
  async syncCart(items: { product_id: number; quantity: number }[]): Promise<CartResponse> {
    const response = await this.request<{cart_items: CartItem[], total_items: number, total_amount: string}>('cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    return {
      items: response.cart_items || [],
      total_items: response.total_items,
      total_amount: response.total_amount
    };
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

  async getOrder(id: number | string): Promise<Order> {
    return this.request<Order>(`orders/${id}`);
  }

  // Public orders endpoints (consumer-facing)
  async getPublicOrders(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<{ data: Order[] }> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `public/orders${queryString ? `?${queryString}` : ''}`;

    return this.request<{ data: Order[] }>(endpoint);
  }

  async getPublicOrder(id: number | string): Promise<Order> {
    // API returns { data: Order }, must unwrap
    const response = await this.request<{ data: Order }>(`public/orders/${id}`);
    return response.data;
  }

  /**
   * Pass TRACKING-DISPLAY-01: Get order by public tracking token (no auth required)
   *
   * @param token UUID public token
   * @returns Order tracking info (status, shipment, etc.)
   */
  async trackOrderByToken(token: string): Promise<OrderTrackingResponse> {
    return this.request<OrderTrackingResponse>(`public/orders/track/${token}`);
  }

  // Direct order creation via Laravel API (Pass 44 - Single Source of Truth)
  // Pass 48: Added shipping_cost parameter
  // Pass ORDER-SHIPPING-SPLIT-01: Added quoted_shipping for mismatch detection
  async createOrder(data: {
    items: { product_id: number; quantity: number }[];
    currency: 'EUR' | 'USD';
    shipping_method: 'HOME' | 'PICKUP' | 'COURIER';
    shipping_address?: ShippingAddress;
    shipping_cost?: number; // Pass 48: Shipping cost in EUR
    payment_method?: 'COD' | 'CARD' | 'BANK_TRANSFER';
    notes?: string;
    quoted_shipping?: number; // Pass ORDER-SHIPPING-SPLIT-01: Quoted shipping for mismatch
    quoted_at?: string; // Pass ORDER-SHIPPING-SPLIT-01: Quote timestamp
  }): Promise<Order> {
    const response = await this.request<{ data: Order }>('public/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Producer methods
  async getProducerKpi(): Promise<ProducerKpi> {
    return this.request<ProducerKpi>('producer/dashboard/kpi');
  }

  async getProducerStats(): Promise<ProducerStats> {
    // Backend canonical endpoint is /producer/dashboard/kpi (authenticated).
    // FE previously called /producer/dashboard/stats which does not exist (404).
    const kpi = await this.request<{
      total_products?: number;
      active_products: number;
      total_orders: number;
      revenue: number | string;
    }>('producer/dashboard/kpi');

    const totalOrders = Number(kpi.total_orders ?? 0);
    const revenueNum = typeof kpi.revenue === 'string' ? Number(kpi.revenue) : Number(kpi.revenue ?? 0);
    const avg = totalOrders > 0 ? (revenueNum / totalOrders) : 0;

    return {
      total_orders: totalOrders,
      total_revenue: String(revenueNum),
      active_products: Number(kpi.active_products ?? 0),
      average_order_value: String(avg),
    };
  }

  async getProducerTopProducts(limit?: number): Promise<{ data: Product[] }> {
    const endpoint = `producer/dashboard/top-products${limit ? `?limit=${limit}` : ''}`;
    // Pass FIX-DASHBOARD-THUMBNAILS-01: API returns { top_products: [...] }, map to { data: [...] }
    const response = await this.request<{ top_products: Product[] }>(endpoint);
    return { data: response.top_products || [] };
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
  async getProducerOrders(status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'): Promise<ProducerOrdersResponse> {
    const endpoint = `producer/orders${status ? `?status=${status}` : ''}`;
    const raw = await this.request<{ success: boolean; orders: ProducerOrderRaw[]; meta: ProducerOrdersResponse['meta'] }>(endpoint);

    // Normalize snake_case (order_items) to camelCase (orderItems)
    const orders: ProducerOrder[] = raw.orders.map(order => ({
      ...order,
      orderItems: order.orderItems ?? order.order_items ?? [],
    }));

    return { ...raw, orders };
  }

  async getProducerOrder(orderId: number): Promise<{ success: boolean; order: ProducerOrder }> {
    const raw = await this.request<{ success: boolean; order: ProducerOrderRaw }>(`producer/orders/${orderId}`);

    // Normalize snake_case (order_items) to camelCase (orderItems)
    const order: ProducerOrder = {
      ...raw.order,
      orderItems: raw.order.orderItems ?? raw.order.order_items ?? [],
    };

    return { ...raw, order };
  }

  async updateProducerOrderStatus(
    orderId: number,
    status: 'processing' | 'shipped' | 'delivered'
  ): Promise<{ success: boolean; message: string; order: ProducerOrder }> {
    const raw = await this.request<{ success: boolean; message: string; order: ProducerOrderRaw }>(
      `producer/orders/${orderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );

    // Normalize snake_case (order_items) to camelCase (orderItems)
    const order: ProducerOrder = {
      ...raw.order,
      orderItems: raw.order.orderItems ?? raw.order.order_items ?? [],
    };

    return { ...raw, order };
  }

  // Pass 57: Export producer orders to CSV
  async exportProducerOrdersCsv(): Promise<Blob> {
    const url = apiUrl('producer/orders/export');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.blob();
  }

  // Pass 50: Get zone-based shipping quote (new V1 endpoint)
  async getZoneShippingQuote(data: {
    postal_code: string;
    method: 'HOME' | 'COURIER' | 'PICKUP';
    weight_kg?: number;
    subtotal?: number;
  }): Promise<{
    price_eur: number;
    zone_name: string | null;
    zone_id?: number;
    method: string;
    free_shipping: boolean;
    free_shipping_reason?: 'threshold' | 'pickup';
    threshold?: number;
    source: 'zone' | 'fallback' | 'threshold' | 'pickup';
  }> {
    return this.request('public/shipping/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Pass ORDER-SHIPPING-SPLIT-01 + COD-COMPLETE: Get per-producer shipping breakdown for cart
  async getCartShippingQuote(data: {
    postal_code: string;
    method: 'HOME' | 'COURIER' | 'PICKUP';
    items: { product_id: number; quantity: number }[];
    payment_method?: 'COD' | 'CARD';
  }): Promise<{
    producers: {
      producer_id: number;
      producer_name: string;
      subtotal: number;
      shipping_cost: number;
      is_free: boolean;
      free_reason: 'threshold' | 'pickup' | null;
      threshold?: number;
      zone: string | null;
      weight_grams: number;
    }[];
    total_shipping: number;
    cod_fee: number;
    payment_method: string;
    quoted_at: string;
    currency: string;
    zone_name: string | null;
    method: string;
  }> {
    return this.request('public/shipping/quote-cart', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Pass 51: Check if card payments are enabled (feature flag)
  async getPaymentConfig(): Promise<{
    card_enabled: boolean;
    cod_enabled: boolean;
    stripe_public_key?: string;
  }> {
    try {
      return this.request('public/payments/config');
    } catch {
      // Fallback: if endpoint doesn't exist, assume card disabled
      return { card_enabled: false, cod_enabled: true };
    }
  }

  // Pass 51: Create Stripe checkout session for card payment
  async createPaymentCheckout(orderId: number): Promise<{
    redirect_url: string;
    session_id: string;
  }> {
    return this.request('public/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
  }

  // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Get user's saved shipping address for checkout
  async getShippingAddress(): Promise<{
    address: {
      name?: string;
      line1?: string;
      line2?: string;
      city?: string;
      postal_code?: string;
      country?: string;
      phone?: string;
    } | null;
    source: 'saved_address' | 'last_order' | null;
  }> {
    return this.request('auth/shipping-address');
  }

  // Pass 61: Admin orders list with filters/pagination/stats
  async getAdminOrders(params?: {
    status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    q?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    per_page?: number;
    sort?: 'created_at' | '-created_at';
  }): Promise<AdminOrdersResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.q) searchParams.set('q', params.q);
    if (params?.from_date) searchParams.set('from_date', params.from_date);
    if (params?.to_date) searchParams.set('to_date', params.to_date);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    if (params?.sort) searchParams.set('sort', params.sort);
    const qs = searchParams.toString();
    return this.request<AdminOrdersResponse>(`admin/orders${qs ? `?${qs}` : ''}`);
  }

  // PRODUCER-ONBOARD-01: Producer profile/status with has_profile flag
  async getProducerMe(): Promise<{
    producer: {
      id: number;
      name: string;
      slug: string;
      status: string;
      is_active: boolean;
      business_name?: string;
      description?: string;
      location?: string;
      phone?: string;
      email?: string;
      rejection_reason?: string | null;
    } | null;
    has_profile: boolean;
  }> {
    return this.request('producer/me');
  }

  // PRODUCER-ONBOARD-01: Update producer profile (onboarding form)
  async updateProducerProfile(data: {
    business_name?: string;
    phone?: string;
    city?: string;
    region?: string;
    description?: string;
    tax_id?: string;
  }): Promise<{ producer: Record<string, unknown>; message: string }> {
    return this.request('producer/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // AUTH-UNIFY-01: Delete a producer product
  // Uses /api/v1/products/{id} (auth:sanctum, ProductController@destroy)
  async deleteProducerProduct(productId: number): Promise<void> {
    await this.request(`products/${productId}`, {
      method: 'DELETE',
    });
  }

  // AUTH-UNIFY-02: Get a single producer product by ID
  // Uses /api/v1/products/{id} (public, ProductController@show)
  async getProducerProduct(productId: number | string): Promise<{
    data: Product;
  }> {
    return this.request<{ data: Product }>(`products/${productId}`);
  }

  // AUTH-UNIFY-02: Create a new producer product
  // Uses POST /api/v1/products (auth:sanctum, ProductController@store)
  async createProducerProduct(data: {
    name: string;
    slug?: string;
    category?: string;
    price: number;
    unit?: string;
    stock: number;
    description?: string;
    image_url?: string | null;
    is_active?: boolean;
  }): Promise<{ data: Product }> {
    return this.request<{ data: Product }>('products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AUTH-UNIFY-02: Update an existing producer product
  // Uses PATCH /api/v1/products/{id} (auth:sanctum, ProductController@update)
  async updateProducerProduct(productId: number | string, data: {
    name?: string;
    slug?: string;
    category?: string;
    price?: number;
    unit?: string;
    stock?: number;
    description?: string;
    image_url?: string | null;
    is_active?: boolean;
  }): Promise<{ data: Product }> {
    return this.request<{ data: Product }>(`products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();

// Helper function for public products
export async function getPublicProducts() {
  const res = await fetch(apiUrl('public/products'), { cache: 'no-store' });
  if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
  return res.json();
}