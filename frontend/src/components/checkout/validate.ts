// Lightweight validation utilities for checkout form
// No external dependencies - pure regex validation

/**
 * Validates Greek phone number formats:
 * - +30XXXXXXXXXX (10 digits after +30)
 * - 0XXXXXXXXX (10 digits starting with 0)
 */
export const isGRPhone = (s: string): boolean => {
  const cleaned = s.replace(/\s+/g, '');
  return /^\+?30\d{10}$/.test(cleaned) || /^0\d{9}$/.test(cleaned);
};

/**
 * Validates Greek postal code (Τ.Κ.)
 * - Must be exactly 5 digits
 */
export const isPostal5 = (s: string): boolean => {
  return /^\d{5}$/.test(String(s || '').trim());
};

/**
 * Validates email format
 * - Basic email regex check
 */
export const isEmail = (s: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
};
