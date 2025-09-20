/**
 * ERD-Aligned TypeScript Models
 * Matches the Laravel backend schema exactly
 */

// User model - matches Laravel users table
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'consumer' | 'producer' | 'admin';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// ProducerProfile model - matches Laravel producers table
export interface ProducerProfile {
  id: number;
  user_id: number;
  name: string;
  business_name?: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: 'pending' | 'active' | 'inactive';
  slug: string;
  is_active: boolean;
  tax_id?: string;
  tax_office?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  social_media?: Record<string, string>;
  verified: boolean;
  uses_custom_shipping_rates: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  user?: User;
}

// Product model - matches updated Laravel products table
export interface Product {
  id: number;
  producer_id: number;
  name: string;
  title: string; // New field for ERD consistency
  slug: string;
  description?: string;
  price: number; // Existing decimal field
  price_cents?: number; // For ERD spec (price * 100)
  currency: string;
  unit: string;
  stock: number;
  weight_per_unit?: number;
  weight_grams?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  is_active: boolean;
  is_organic: boolean;
  discount_price?: number;
  is_seasonal: boolean;
  status: 'available' | 'unavailable' | 'seasonal';
  created_at: string;
  updated_at: string;

  // Relations
  producer?: ProducerProfile;
  categories?: Category[];
  images?: ProductImage[];
}

// Order model - matches Laravel orders table
export interface Order {
  id: number;
  user_id?: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  total_cents?: number; // For ERD spec (total_amount * 100)
  currency: string;
  payment_status: 'pending' | 'paid' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'delivered' | 'cancelled' | 'paid';
  shipping_method?: string;
  shipping_address?: Record<string, any>;
  billing_address?: Record<string, any>;
  shipping_cost: number;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Relations
  user?: User;
  items?: OrderItem[];
  shipment?: Shipment;
}

// OrderItem model - matches Laravel order_items table
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  producer_id?: number;
  quantity: number;
  unit_price: number;
  unit_price_cents?: number; // For ERD spec (unit_price * 100)
  total_price: number;
  line_total_cents?: number; // For ERD spec (total_price * 100)
  product_name: string;
  product_unit?: string;
  created_at: string;
  updated_at: string;

  // Relations
  order?: Order;
  product?: Product;
  producer?: ProducerProfile;
}

// Address model - NEW table created in migration
export interface Address {
  id: number;
  user_id: number;
  type: 'shipping' | 'billing';
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
  created_at: string;
  updated_at: string;

  // Relations
  user?: User;
}

// Shipment model - NEW table created in migration
export interface Shipment {
  id: number;
  order_id: number;
  courier_code?: string;
  tracking_number?: string;
  cost_cents?: number;
  status?: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  created_at: string;
  updated_at: string;

  // Relations
  order?: Order;
}

// Existing models to maintain compatibility
export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  image_path?: string;
  alt_text?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;

  // Relations
  product?: Product;
  subtotal?: string; // Computed field
}

// API Response wrappers
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CartResponse {
  items: CartItem[];
  total_items: number;
  total_amount: string;
}

// Utility types for working with ERD models
export type UserRole = User['role'];
export type OrderStatus = Order['status'];
export type PaymentStatus = Order['payment_status'];
export type ProducerStatus = ProducerProfile['status'];
export type AddressType = Address['type'];
export type ShipmentStatus = NonNullable<Shipment['status']>;

// Type guards for role checking
export const isConsumer = (user: User): boolean => user.role === 'consumer';
export const isProducer = (user: User): boolean => user.role === 'producer';
export const isAdmin = (user: User): boolean => user.role === 'admin';

// Helper functions for price conversion
export const toCents = (amount: number): number => Math.round(amount * 100);
export const fromCents = (cents: number): number => cents / 100;