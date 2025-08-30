/**
 * Greek Text Processing Utilities for Search and i18n
 */

// Greek character normalization map (with and without accents)
const GREEK_NORMALIZATION_MAP: Record<string, string> = {
  // Lowercase vowels with accents
  'ά': 'α', 'έ': 'ε', 'ή': 'η', 'ί': 'ι', 'ό': 'ο', 'ύ': 'υ', 'ώ': 'ω',
  // Uppercase vowels with accents  
  'Ά': 'Α', 'Έ': 'Ε', 'Ή': 'Η', 'Ί': 'Ι', 'Ό': 'Ο', 'Ύ': 'Υ', 'Ώ': 'Ω',
  // Diaeresis
  'ϊ': 'ι', 'ϋ': 'υ', 'Ϊ': 'Ι', 'Ϋ': 'Υ',
  // Combined accents and diaeresis
  'ΐ': 'ι', 'ΰ': 'υ',
  // Final sigma
  'ς': 'σ'
};

// Common Greek food/product term variations for fuzzy matching
const GREEK_SYNONYMS: Record<string, string[]> = {
  // Vegetables
  'τομάτα': ['ντομάτα', 'τοματα', 'ντοματα'],
  'ντομάτα': ['τομάτα', 'τοματα', 'ντοματα'],
  'πατάτα': ['πατατα'],
  'κρεμμύδι': ['κρεμμυδι'],
  'αγγούρι': ['αγγουρι'],
  'καρότο': ['καροτο'],
  
  // Fruits
  'πορτοκάλι': ['πορτοκαλι'],
  'μήλο': ['μηλο'],
  'μπανάνα': ['μπανανα'],
  'σταφύλι': ['σταφυλι'],
  
  // Dairy
  'γάλα': ['γαλα'],
  'τυρί': ['τυρι'],
  'γιαούρτι': ['γιαουρτι', 'γιαουρτ'],
  
  // Meat/Protein
  'κρέας': ['κρεας'],
  'κοτόπουλο': ['κοτοπουλο'],
  'ψάρι': ['ψαρι'],
  'αβγό': ['αβγο', 'αυγό', 'αυγο'],
  
  // Common adjectives
  'βιολογικό': ['βιολογικο', 'βιο'],
  'φρέσκο': ['φρεσκο'],
  'τοπικό': ['τοπικο'],
  'παραδοσιακό': ['παραδοσιακο']
};

/**
 * Normalize Greek text by removing accents and handling character variations
 */
export function normalizeGreekText(text: string): string {
  let normalized = text.toLowerCase();
  
  // Replace accented characters
  for (const [accented, plain] of Object.entries(GREEK_NORMALIZATION_MAP)) {
    normalized = normalized.replace(new RegExp(accented, 'g'), plain);
  }
  
  return normalized;
}

/**
 * Create a Greek-insensitive search term with all possible variations
 */
export function createGreekSearchTerms(query: string): string[] {
  const normalized = normalizeGreekText(query.trim());
  const terms = [normalized, query.toLowerCase()];
  
  // Add synonyms if available
  for (const [key, synonyms] of Object.entries(GREEK_SYNONYMS)) {
    if (normalizeGreekText(key).includes(normalized) || normalized.includes(normalizeGreekText(key))) {
      terms.push(...synonyms.map(s => normalizeGreekText(s)));
    }
  }
  
  return [...new Set(terms)].filter(term => term.length > 0);
}

/**
 * Check if a text matches any of the Greek search terms (fuzzy matching)
 */
export function matchesGreekSearch(text: string, searchTerms: string[]): boolean {
  if (!text || searchTerms.length === 0) return false;
  
  const normalizedText = normalizeGreekText(text);
  
  return searchTerms.some(term => {
    // Exact match
    if (normalizedText.includes(term)) return true;
    
    // Fuzzy match for Greek words (allow 1-2 character differences for longer words)
    if (term.length > 4) {
      const words = normalizedText.split(/\s+/);
      return words.some(word => {
        if (word.length < 3) return false;
        
        // Calculate simple edit distance
        const distance = calculateEditDistance(word, term);
        const threshold = Math.min(2, Math.floor(term.length * 0.2)); // 20% error tolerance
        return distance <= threshold;
      });
    }
    
    return false;
  });
}

/**
 * Simple edit distance calculation for fuzzy matching
 */
function calculateEditDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Enhanced Greek currency formatting
 */
export function formatGreekCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Greek number formatting (for quantities, etc.)
 */
export function formatGreekNumber(number: number): string {
  return new Intl.NumberFormat('el-GR').format(number);
}

/**
 * Greek date formatting
 */
export function formatGreekDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('el-GR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
}

/**
 * Greek relative time formatting (e.g., "πριν από 2 ημέρες")
 */
export function formatGreekRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'τώρα';
  if (diffInSeconds < 3600) return `πριν από ${Math.floor(diffInSeconds / 60)} λεπτά`;
  if (diffInSeconds < 86400) return `πριν από ${Math.floor(diffInSeconds / 3600)} ώρες`;
  if (diffInSeconds < 604800) return `πριν από ${Math.floor(diffInSeconds / 86400)} ημέρες`;
  
  return formatGreekDate(dateObj);
}

// Greek localization strings
export const GREEK_LABELS = {
  // Search & Filters
  search: {
    placeholder: 'Αναζήτηση προϊόντων...',
    noResults: 'Δεν βρέθηκαν προϊόντα',
    filters: 'Φίλτρα',
    clearAll: 'Καθαρισμός όλων',
    category: 'Κατηγορία',
    producer: 'Παραγωγός',
    priceRange: 'Εύρος Τιμών',
    sortBy: 'Ταξινόμηση',
    organic: 'Βιολογικό',
    allCategories: 'Όλες οι κατηγορίες',
    allProducers: 'Όλοι οι παραγωγοί',
    allProducts: 'Όλα τα προϊόντα',
    organicOnly: 'Μόνο βιολογικά',
    nonOrganic: 'Μη βιολογικά'
  },
  
  // Product
  product: {
    price: 'Τιμή',
    unit: 'Μονάδα',
    stock: 'Απόθεμα',
    addToCart: 'Προσθήκη στο καλάθι',
    outOfStock: 'Μη διαθέσιμο',
    viewDetails: 'Δείτε λεπτομέρειες',
    inStock: 'Διαθέσιμο',
    quantity: 'Ποσότητα'
  },
  
  // Cart
  cart: {
    title: 'Καλάθι Αγορών',
    empty: 'Το καλάθι σας είναι κενό',
    total: 'Σύνολο',
    checkout: 'Ολοκλήρωση Παραγγελίας',
    continueShopping: 'Συνέχεια Αγορών',
    remove: 'Αφαίρεση',
    update: 'Ενημέρωση'
  },
  
  // Common
  common: {
    loading: 'Φόρτωση...',
    error: 'Σφάλμα',
    retry: 'Δοκιμάστε ξανά',
    save: 'Αποθήκευση',
    cancel: 'Ακύρωση',
    ok: 'Εντάξει',
    yes: 'Ναι',
    no: 'Όχι'
  },
  
  // Sort options
  sort: {
    newest: 'Νεότερα πρώτα',
    oldest: 'Παλαιότερα πρώτα', 
    nameAsc: 'Όνομα (Α-Ω)',
    nameDesc: 'Όνομα (Ω-Α)',
    priceAsc: 'Τιμή (Φθηνότερα)',
    priceDesc: 'Τιμή (Ακριβότερα)'
  }
};

/**
 * Get localized label with fallback to English
 */
export function getGreekLabel(path: string, fallback?: string): string {
  const keys = path.split('.');
  let current: any = GREEK_LABELS;
  
  for (const key of keys) {
    current = current?.[key];
    if (!current) break;
  }
  
  return current || fallback || path;
}