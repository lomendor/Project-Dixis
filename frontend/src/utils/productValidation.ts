import { Product } from '@/lib/api';

export interface ProductValidationResult {
  isValid: boolean;
  product: Product | null;
  errors: string[];
  warnings: string[];
}

/**
 * Validates and sanitizes product data for robust display
 */
export function validateProductData(data: any): ProductValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data exists
  if (!data) {
    return {
      isValid: false,
      product: null,
      errors: ['No product data provided'],
      warnings: []
    };
  }

  // Required fields validation
  if (!data.id || typeof data.id !== 'number') {
    errors.push('Missing or invalid product ID');
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Missing or invalid product name');
  }

  if (!data.price || (typeof data.price !== 'string' && typeof data.price !== 'number')) {
    errors.push('Missing or invalid product price');
  }

  // Optional field validation with warnings
  if (!data.description || data.description.trim() === '') {
    warnings.push('Product description is missing');
  }

  if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
    warnings.push('No product images available');
  }

  if (!data.producer || typeof data.producer !== 'object') {
    warnings.push('Producer information is missing or invalid');
  }

  if (!data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
    warnings.push('No product categories assigned');
  }

  // If there are critical errors, return invalid
  if (errors.length > 0) {
    return {
      isValid: false,
      product: null,
      errors,
      warnings
    };
  }

  // Sanitize and normalize the product data
  const sanitizedProduct: Product = {
    id: data.id,
    name: data.name.trim(),
    price: String(data.price),
    unit: data.unit || 'τεμ',
    stock: typeof data.stock === 'number' ? data.stock : null,
    is_active: Boolean(data.is_active),
    description: data.description?.trim() || null,
    categories: Array.isArray(data.categories) ? data.categories : [],
    images: Array.isArray(data.images) ? data.images : [],
    producer: data.producer || {
      id: 0,
      name: 'Άγνωστος Παραγωγός',
      business_name: '',
      description: null,
      location: null
    }
  };

  return {
    isValid: true,
    product: sanitizedProduct,
    errors,
    warnings
  };
}

/**
 * Determines error type based on API error for better error handling
 */
export function classifyApiError(error: Error): 'not-found' | 'server-error' | 'network-error' | 'unknown' {
  const message = error.message.toLowerCase();
  
  if (message.includes('404') || message.includes('not found')) {
    return 'not-found';
  }
  
  if (message.includes('500') || message.includes('server') || message.includes('internal')) {
    return 'server-error';
  }
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'network-error';
  }
  
  return 'unknown';
}