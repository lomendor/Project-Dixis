/**
 * Checkout Validation Utilities for Greek Market
 * Comprehensive validation for checkout process with Greek postal codes and error handling
 */

import { z } from 'zod';

// Greek postal codes and major cities mapping
export const GREEK_POSTAL_CODES: Record<string, string[]> = {
  // Athens Metro Area
  '10': ['Αθήνα', 'Athens'],
  '11': ['Αθήνα', 'Athens', 'Νέα Ιωνία', 'Νέα Φιλαδέλφεια', 'Άγιος Δημήτριος'],
  '12': ['Αθήνα', 'Athens', 'Περιστέρι', 'Πετρούπολη'],
  '13': ['Αθήνα', 'Athens', 'Αχαρνές', 'Μενίδι'],
  '14': ['Αθήνα', 'Athens', 'Ίλιον', 'Λυκόβρυση'],
  '15': ['Αθήνα', 'Athens', 'Αμαρούσιο', 'Χαλάνδρι', 'Κηφισιά'],
  '16': ['Αθήνα', 'Athens', 'Γλυφάδα', 'Βούλα', 'Βουλιαγμένη'],
  '17': ['Αθήνα', 'Athens', 'Καλλιθέα', 'Νέα Σμύρνη', 'Άλιμος'],
  '18': ['Πειραιάς', 'Piraeus', 'Κερατσίνι', 'Νίκαια'],
  '19': ['Αθήνα', 'Athens', 'Κορυδαλλός', 'Παλαιό Φάληρο'],

  // Thessaloniki
  '54': ['Θεσσαλονίκη', 'Thessaloniki'],
  '55': ['Θεσσαλονίκη', 'Thessaloniki', 'Καλαμαριά'],
  '56': ['Θεσσαλονίκη', 'Thessaloniki', 'Εύοσμος'],
  '57': ['Θεσσαλονίκη', 'Thessaloniki'],

  // Patras
  '26': ['Πάτρα', 'Patras', 'Ρίο'],

  // Heraklion Crete
  '70': ['Ηράκλειο', 'Heraklion'],
  '71': ['Ηράκλειο', 'Heraklion'],

  // Rhodes and other Dodecanese
  '85': ['Ρόδος', 'Rhodes', 'Δωδεκάνησα', 'Dodecanese'],

  // Cyclades (Mykonos, Santorini, etc.) and Dodecanese
  '84': ['Μύκονος', 'Mykonos', 'Σαντορίνη', 'Santorini', 'Θήρα', 'Thira', 'Κυκλάδες', 'Cyclades', 'Δωδεκάνησα', 'Dodecanese'],

  // Common areas
  '20': ['Κόρινθος', 'Corinth'],
  '22': ['Τρίπολη', 'Tripoli'],
  '24': ['Καβάλα', 'Kavala'],
  '25': ['Κοζάνη', 'Kozani'],
  '30': ['Αγρίνιο', 'Agrinio'],
  '38': ['Βόλος', 'Volos'],
  '40': ['Λάρισα', 'Larissa'],
  '45': ['Ιωάννινα', 'Ioannina'],
  '49': ['Κέρκυρα', 'Corfu'],
  '60': ['Σέρρες', 'Serres'],
  '65': ['Καστοριά', 'Kastoria'],
  '68': ['Φλώρινα', 'Florina'],
  '72': ['Χανιά', 'Chania'],
  '73': ['Ρέθυμνο', 'Rethymno'],
  '74': ['Λασίθι', 'Lasithi'],
  '80': ['Ρόδος', 'Rhodes'],
  '81': ['Λέσβος', 'Lesbos', 'Μυτιλήνη', 'Mytilene'],
  '82': ['Χίος', 'Chios'],
  '83': ['Κεφαλληνία', 'Kefalonia', 'Φωκίδα', 'Phocis'],
};

// Enhanced Zod schema for Greek checkout validation
export const checkoutValidationSchema = z.object({
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
    
  address: z.string()
    .min(5, 'Η διεύθυνση πρέπει να έχει τουλάχιστον 5 χαρακτήρες')
    .max(200, 'Η διεύθυνση είναι πολύ μεγάλη'),
    
  city: z.string()
    .min(2, 'Η πόλη πρέπει να έχει τουλάχιστον 2 χαρακτήρες')
    .max(50, 'Το όνομα της πόλης είναι πολύ μεγάλο')
    .regex(/^[Α-Ωα-ωA-Za-z\s\-']+$/u, 'Η πόλη περιέχει μη έγκυρους χαρακτήρες'),
    
  postalCode: z.string()
    .regex(/^\d{5}$/, 'Ο ταχυδρομικός κώδικας πρέπει να έχει ακριβώς 5 ψηφία')
    .refine((code) => {
      const prefix = code.substring(0, 2);
      return Object.keys(GREEK_POSTAL_CODES).includes(prefix);
    }, 'Μη έγκυρος ταχυδρομικός κώδικας για Ελλάδα'),
});

// Cross-validation for postal code and city combination
export const validatePostalCodeCity = (postalCode: string, city: string): boolean => {
  if (!postalCode || !city) return false;
  
  const prefix = postalCode.substring(0, 2);
  const validCities = GREEK_POSTAL_CODES[prefix];
  
  if (!validCities) return false;
  
  // Normalize city for comparison (remove accents, convert to lowercase)
  const normalizedCity = city.trim().toLowerCase()
    .replace(/[άα]/g, 'α')
    .replace(/[έε]/g, 'ε')
    .replace(/[ήη]/g, 'η')
    .replace(/[ίι]/g, 'ι')
    .replace(/[όο]/g, 'ο')
    .replace(/[ύυ]/g, 'υ')
    .replace(/[ώω]/g, 'ω');
  
  return validCities.some(validCity => 
    validCity.toLowerCase().includes(normalizedCity) || 
    normalizedCity.includes(validCity.toLowerCase())
  );
};

// Validation error types with Greek messages
export interface CheckoutValidationError {
  field: string;
  message: string;
  code: 'REQUIRED' | 'INVALID' | 'FORMAT' | 'MISMATCH' | 'LENGTH';
}

// HTTP Error handling with Greek messages
export interface CheckoutHttpError {
  type: '422' | '429' | '500' | '502' | '503' | 'NETWORK';
  message: string;
  retryable: boolean;
  retryAfter?: number;
}

export const getErrorMessage = (error: CheckoutHttpError): string => {
  switch (error.type) {
    case '422':
      return 'Τα στοιχεία που εισάγατε δεν είναι έγκυρα. Παρακαλώ ελέγξτε και δοκιμάστε ξανά.';
    case '429':
      return 'Πολλές αιτήσεις. Παρακαλώ περιμένετε λίγο και δοκιμάστε ξανά.';
    case '500':
    case '502':
    case '503':
      return 'Προσωρινό πρόβλημα με τον διακομιστή. Παρακαλώ δοκιμάστε ξανά σε λίγο.';
    case 'NETWORK':
      return 'Πρόβλημα σύνδεσης. Ελέγξτε τη σύνδεσή σας στο διαδίκτυο και δοκιμάστε ξανά.';
    default:
      return 'Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.';
  }
};

// Comprehensive checkout data validation with proof
export const validateCheckoutPayload = (payload: any): {
  isValid: boolean;
  errors: CheckoutValidationError[];
  proof: string;
} => {
  const errors: CheckoutValidationError[] = [];
  const timestamp = new Date().toISOString();
  
  console.log(`🔍 [${timestamp}] Validating checkout payload:`, JSON.stringify(payload, null, 2));
  
  try {
    // Validate with Zod schema
    const validation = checkoutValidationSchema.safeParse(payload);
    
    if (!validation.success) {
      validation.error.errors.forEach(err => {
        errors.push({
          field: err.path.join('.'),
          message: err.message,
          code: 'INVALID'
        });
      });
    }
    
    // Additional custom validations
    if (payload.postalCode && payload.city) {
      if (!validatePostalCodeCity(payload.postalCode, payload.city)) {
        errors.push({
          field: 'city',
          message: 'Η πόλη δεν αντιστοιχεί στον ταχυδρομικό κώδικα',
          code: 'MISMATCH'
        });
      }
    }
    
    const proof = `
🔒 CHECKOUT VALIDATION PROOF
═══════════════════════════
⏰ Timestamp: ${timestamp}
📍 Postal Code: ${payload.postalCode || 'NOT PROVIDED'}
🏙️ City: ${payload.city || 'NOT PROVIDED'}
✅ Schema Valid: ${validation.success}
❌ Errors Found: ${errors.length}
🔍 Validation Details:
${errors.map(e => `  • ${e.field}: ${e.message}`).join('\n')}
═══════════════════════════
    `.trim();
    
    console.log('🔒 Validation proof generated:', proof);
    
    return {
      isValid: errors.length === 0,
      errors,
      proof
    };
    
  } catch (error) {
    const errorProof = `
🚨 VALIDATION ERROR
══════════════════
⏰ Timestamp: ${timestamp}
💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}
══════════════════
    `.trim();
    
    console.error('❌ Validation failed with error:', errorProof);
    
    return {
      isValid: false,
      errors: [{
        field: 'general',
        message: 'Σφάλμα επικύρωσης δεδομένων',
        code: 'INVALID'
      }],
      proof: errorProof
    };
  }
};

export type CheckoutFormData = z.infer<typeof checkoutValidationSchema>;