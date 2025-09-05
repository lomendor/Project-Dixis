/**
 * Checkout Flow Validation Schemas for Greek Marketplace
 * Core Zod validation schemas for checkout-related data structures
 */

import { z } from 'zod';

// Cart line item schema for product + quantity validation
export const CartLineSchema = z.object({
  id: z.number().int('Το ID του προϊόντος πρέπει να είναι ακέραιος αριθμός'),
  product_id: z.number().int('Το ID του προϊόντος πρέπει να είναι ακέραιος αριθμός'),
  name: z.string()
    .min(1, 'Το όνομα του προϊόντος είναι υποχρεωτικό')
    .max(200, 'Το όνομα του προϊόντος είναι πολύ μεγάλο'),
  price: z.number()
    .min(0.01, 'Η τιμή πρέπει να είναι μεγαλύτερη από 0')
    .max(9999.99, 'Η τιμή είναι πολύ υψηλή'),
  quantity: z.number()
    .int('Η ποσότητα πρέπει να είναι ακέραιος αριθμός')
    .min(1, 'Η ποσότητα πρέπει να είναι τουλάχιστον 1')
    .max(999, 'Η ποσότητα είναι πολύ υψηλή'),
  subtotal: z.number()
    .min(0.01, 'Το υποσύνολο πρέπει να είναι μεγαλύτερο από 0'),
  producer_name: z.string()
    .min(1, 'Το όνομα του παραγωγού είναι υποχρεωτικό')
    .max(100, 'Το όνομα του παραγωγού είναι πολύ μεγάλο'),
});

// Shipping method schema with Greek postal code validation
export const ShippingMethodSchema = z.object({
  id: z.string()
    .min(1, 'Το ID της μεθόδου παράδοσης είναι υποχρεωτικό'),
  name: z.string()
    .min(1, 'Το όνομα της μεθόδου παράδοσης είναι υποχρεωτικό')
    .max(100, 'Το όνομα της μεθόδου παράδοσης είναι πολύ μεγάλο'),
  description: z.string()
    .max(500, 'Η περιγραφή είναι πολύ μεγάλη')
    .optional(),
  price: z.number()
    .min(0, 'Το κόστος παράδοσης δεν μπορεί να είναι αρνητικό')
    .max(999.99, 'Το κόστος παράδοσης είναι πολύ υψηλό'),
  estimated_days: z.number()
    .int('Οι εκτιμώμενες ημέρες πρέπει να είναι ακέραιος αριθμός')
    .min(0, 'Οι εκτιμώμενες ημέρες δεν μπορούν να είναι αρνητικές')
    .max(90, 'Οι εκτιμώμενες ημέρες είναι πολλές'),
  available_for_postal_codes: z.array(z.string().regex(/^\d{2}$/, 'Μη έγκυρος κωδικός περιοχής'))
    .optional(),
});

// Payment method schema with Greek market specific validation
export const PaymentMethodSchema = z.object({
  id: z.string()
    .min(1, 'Το ID της μεθόδου πληρωμής είναι υποχρεωτικό'),
  type: z.enum(['card', 'bank_transfer', 'cash_on_delivery', 'digital_wallet'], {
    errorMap: () => ({ message: 'Μη έγκυρη μέθοδος πληρωμής' }),
  }),
  name: z.string()
    .min(1, 'Το όνομα της μεθόδου πληρωμής είναι υποχρεωτικό')
    .max(100, 'Το όνομα της μεθόδου πληρωμής είναι πολύ μεγάλο'),
  description: z.string()
    .max(500, 'Η περιγραφή είναι πολύ μεγάλη')
    .optional(),
  fee_percentage: z.number()
    .min(0, 'Το ποσοστό χρέωσης δεν μπορεί να είναι αρνητικό')
    .max(10, 'Το ποσοστό χρέωσης είναι πολύ υψηλό')
    .optional(),
  fixed_fee: z.number()
    .min(0, 'Η σταθερή χρέωση δεν μπορεί να είναι αρνητική')
    .max(99.99, 'Η σταθερή χρέωση είναι πολύ υψηλή')
    .optional(),
  minimum_amount: z.number()
    .min(0, 'Το ελάχιστο ποσό δεν μπορεί να είναι αρνητικό')
    .optional(),
});

// Order summary schema for final checkout validation
export const OrderSummarySchema = z.object({
  items: z.array(CartLineSchema)
    .min(1, 'Το καλάθι δεν μπορεί να είναι κενό')
    .max(50, 'Το καλάθι περιέχει πολλά προϊόντα'),
  subtotal: z.number()
    .min(0.01, 'Το υποσύνολο πρέπει να είναι μεγαλύτερο από 0'),
  shipping_method: ShippingMethodSchema,
  shipping_cost: z.number()
    .min(0, 'Το κόστος παράδοσης δεν μπορεί να είναι αρνητικό'),
  payment_method: PaymentMethodSchema,
  payment_fees: z.number()
    .min(0, 'Οι χρεώσεις πληρωμής δεν μπορούν να είναι αρνητικές'),
  tax_amount: z.number()
    .min(0, 'Το ποσό φόρου δεν μπορεί να είναι αρνητικό'),
  total_amount: z.number()
    .min(0.01, 'Το συνολικό ποσό πρέπει να είναι μεγαλύτερο από 0')
    .max(99999.99, 'Το συνολικό ποσό είναι πολύ υψηλό'),
  estimated_delivery_date: z.string()
    .datetime('Μη έγκυρη ημερομηνία παράδοσης')
    .optional(),
});

// Complete checkout form combining personal info + order details
export const CheckoutFormSchema = z.object({
  // Personal & shipping information
  customer: z.object({
    firstName: z.string()
      .min(2, 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες')
      .max(50, 'Το όνομα είναι πολύ μεγάλο')
      .regex(/^[Α-Ωα-ωA-Za-z\s\-']+$/u, 'Το όνομα περιέχει μη έγκυρους χαρακτήρες'),
    lastName: z.string()
      .min(2, 'Το επώνυμο πρέπει να έχει τουλάχιστον 2 χαρακτήρες')
      .max(50, 'Το επώνυμο είναι πολύ μεγάλο')
      .regex(/^[Α-Ωα-ωA-Za-z\s\-']+$/u, 'Το επώνυμο περιέχει μη έγκυρους χαρακτήρες'),
    email: z.string()
      .email('Μη έγκυρη διεύθυνση email')
      .min(5, 'Η διεύθυνση email είναι πολύ μικρή')
      .max(100, 'Η διεύθυνση email είναι πολύ μεγάλη'),
    phone: z.string()
      .min(10, 'Το τηλέφωνο πρέπει να έχει τουλάχιστον 10 ψηφία')
      .max(15, 'Το τηλέφωνο είναι πολύ μεγάλο')
      .regex(/^(\+30|0030|30)?[2-9]\d{8,9}$/, 'Μη έγκυρος αριθμός τηλεφώνου για Ελλάδα'),
  }),
  
  // Shipping address
  shipping: z.object({
    address: z.string()
      .min(5, 'Η διεύθυνση πρέπει να έχει τουλάχιστον 5 χαρακτήρες')
      .max(200, 'Η διεύθυνση είναι πολύ μεγάλη'),
    city: z.string()
      .min(2, 'Η πόλη πρέπει να έχει τουλάχιστον 2 χαρακτήρες')
      .max(50, 'Το όνομα της πόλης είναι πολύ μεγάλο')
      .regex(/^[Α-Ωα-ωA-Za-z\s\-']+$/u, 'Η πόλη περιέχει μη έγκυρους χαρακτήρες'),
    postalCode: z.string()
      .regex(/^\d{5}$/, 'Ο ταχυδρομικός κώδικας πρέπει να έχει ακριβώς 5 ψηφία'),
    notes: z.string()
      .max(500, 'Οι παρατηρήσεις είναι πολύ μεγάλες')
      .optional(),
  }),
  
  // Order details
  order: OrderSummarySchema,
  
  // Checkout metadata
  session_id: z.string()
    .min(1, 'Το session ID είναι υποχρεωτικό'),
  terms_accepted: z.boolean()
    .refine(val => val === true, 'Πρέπει να αποδεχτείτε τους όρους και προϋποθέσεις'),
  marketing_consent: z.boolean()
    .optional()
    .default(false),
  created_at: z.string()
    .datetime('Μη έγκυρη ημερομηνία δημιουργίας')
    .optional(),
});

// Type exports for use throughout the application
export type CartLine = z.infer<typeof CartLineSchema>;
export type ShippingMethod = z.infer<typeof ShippingMethodSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type OrderSummary = z.infer<typeof OrderSummarySchema>;
export type CheckoutForm = z.infer<typeof CheckoutFormSchema>;

// Basic validation functions
export const validateCartLine = (data: unknown): CartLine => {
  return CartLineSchema.parse(data);
};

export const validateShippingMethod = (data: unknown): ShippingMethod => {
  return ShippingMethodSchema.parse(data);
};

export const validatePaymentMethod = (data: unknown): PaymentMethod => {
  return PaymentMethodSchema.parse(data);
};

export const validateOrderSummary = (data: unknown): OrderSummary => {
  return OrderSummarySchema.parse(data);
};

export const validateCheckoutForm = (data: unknown): CheckoutForm => {
  return CheckoutFormSchema.parse(data);
};

// Greek currency formatting utility
export const formatEuroPrice = (price: number): string => {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(price);
};