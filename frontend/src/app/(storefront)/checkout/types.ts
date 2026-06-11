// Checkout shared types — extracted from page.tsx monolith

// Legacy single-quote shipping (used as fallback)
export interface ShippingQuote {
  price_eur: number;
  zone_name: string | null;
  free_shipping: boolean;
  source: string;
}

// Per-producer shipping breakdown
export interface ProducerShipping {
  producer_id: number;
  producer_name: string;
  subtotal: number;
  shipping_cost: number;
  is_free: boolean;
  // Aligned with CartShippingQuoteSchema (the validated API shape):
  free_reason: 'threshold' | 'pickup' | null;
  threshold?: number;
  zone: string | null;
  weight_grams: number;
}

export interface CartShippingQuote {
  producers: ProducerShipping[];
  total_shipping: number;
  cod_fee: number;
  payment_method: string;
  quoted_at: string;
  currency: string;
  zone_name: string | null;
  method: string;
}
