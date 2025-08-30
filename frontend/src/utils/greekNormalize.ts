/**
 * Greek Text Normalization Utilities
 * Functions for normalizing Greek text by removing accents/tonos for search purposes
 */

/**
 * Character mapping for Greek accent removal
 * Maps accented characters to their unaccented equivalents
 */
const GREEK_ACCENT_MAP: Record<string, string> = {
  // Lowercase vowels with accents
  'ά': 'α', // alpha with tonos
  'έ': 'ε', // epsilon with tonos
  'ή': 'η', // eta with tonos
  'ί': 'ι', // iota with tonos
  'ό': 'ο', // omicron with tonos
  'ύ': 'υ', // upsilon with tonos
  'ώ': 'ω', // omega with tonos
  
  // Uppercase vowels with accents
  'Ά': 'Α', // Alpha with tonos
  'Έ': 'Ε', // Epsilon with tonos
  'Ή': 'Η', // Eta with tonos
  'Ί': 'Ι', // Iota with tonos
  'Ό': 'Ο', // Omicron with tonos
  'Ύ': 'Υ', // Upsilon with tonos
  'Ώ': 'Ω', // Omega with tonos
  
  // Diaeresis (dialytika)
  'ϊ': 'ι', // iota with dialytika
  'ϋ': 'υ', // upsilon with dialytika
  'Ϊ': 'Ι', // Iota with dialytika
  'Ϋ': 'Υ', // Upsilon with dialytika
  
  // Combined accents (dialytika + tonos)
  'ΐ': 'ι', // iota with dialytika and tonos
  'ΰ': 'υ', // upsilon with dialytika and tonos
};

/**
 * Additional character normalizations for better search matching
 */
const ADDITIONAL_NORMALIZATIONS: Record<string, string> = {
  // Final sigma variants
  'ς': 'σ', // final sigma to regular sigma
  'Σ': 'Σ', // final Sigma to regular Sigma (rare but possible)
  
  // Historical/polytonic characters (in case they appear)
  'ἀ': 'α', 'ἁ': 'α', 'ἂ': 'α', 'ἃ': 'α', 'ἄ': 'α', 'ἅ': 'α', 'ἆ': 'α', 'ἇ': 'α',
  'ἐ': 'ε', 'ἑ': 'ε', 'ἒ': 'ε', 'ἓ': 'ε', 'ἔ': 'ε', 'ἕ': 'ε',
  'ἠ': 'η', 'ἡ': 'η', 'ἢ': 'η', 'ἣ': 'η', 'ἤ': 'η', 'ἥ': 'η', 'ἦ': 'η', 'ἧ': 'η',
  'ἰ': 'ι', 'ἱ': 'ι', 'ἲ': 'ι', 'ἳ': 'ι', 'ἴ': 'ι', 'ἵ': 'ι', 'ἶ': 'ι', 'ἷ': 'ι',
  'ὀ': 'ο', 'ὁ': 'ο', 'ὂ': 'ο', 'ὃ': 'ο', 'ὄ': 'ο', 'ὅ': 'ο',
  'ὐ': 'υ', 'ὑ': 'υ', 'ὒ': 'υ', 'ὓ': 'υ', 'ὔ': 'υ', 'ὕ': 'υ', 'ὖ': 'υ', 'ὗ': 'υ',
  'ὠ': 'ω', 'ὡ': 'ω', 'ὢ': 'ω', 'ὣ': 'ω', 'ὤ': 'ω', 'ὥ': 'ω', 'ὦ': 'ω', 'ὧ': 'ω',
};

/**
 * Removes Greek accents (tonos) and diaeresis from text
 * Converts "Πορτοκάλια" → "Πορτοκαλια" for accent-insensitive search
 * 
 * @param text - The Greek text to normalize
 * @returns The normalized text without accents
 * 
 * @example
 * ```typescript
 * greekNormalize('Πορτοκάλια'); // → 'Πορτοκαλια'
 * greekNormalize('Καφές'); // → 'Καφες'
 * greekNormalize('Τυρί'); // → 'Τυρι'
 * greekNormalize('Αγγούρια'); // → 'Αγγουρια'
 * ```
 */
export function greekNormalize(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let normalized = text;

  // Apply Greek accent removal
  for (const [accented, unaccented] of Object.entries(GREEK_ACCENT_MAP)) {
    normalized = normalized.replace(new RegExp(accented, 'g'), unaccented);
  }

  // Apply additional normalizations
  for (const [original, normalized_char] of Object.entries(ADDITIONAL_NORMALIZATIONS)) {
    normalized = normalized.replace(new RegExp(original, 'g'), normalized_char);
  }

  return normalized;
}

/**
 * Creates a search-friendly version of Greek text
 * Combines accent removal with case normalization and whitespace cleanup
 * 
 * @param text - The text to prepare for searching
 * @param options - Normalization options
 * @returns Search-ready text
 * 
 * @example
 * ```typescript
 * greekSearchNormalize('  Φρέσκα Πορτοκάλια  '); // → 'φρεσκα πορτοκαλια'
 * greekSearchNormalize('ΚΑΦΈΣ', { lowercase: false }); // → 'ΚΑΦΕΣ'
 * ```
 */
export function greekSearchNormalize(
  text: string, 
  options: {
    lowercase?: boolean;
    trimWhitespace?: boolean;
    normalizeWhitespace?: boolean;
  } = {}
): string {
  const {
    lowercase = true,
    trimWhitespace = true,
    normalizeWhitespace = true,
  } = options;

  if (!text || typeof text !== 'string') {
    return '';
  }

  let result = greekNormalize(text);

  // Convert to lowercase for case-insensitive matching
  if (lowercase) {
    result = result.toLowerCase();
  }

  // Normalize whitespace (multiple spaces become single space)
  if (normalizeWhitespace) {
    result = result.replace(/\s+/g, ' ');
  }

  // Trim leading/trailing whitespace
  if (trimWhitespace) {
    result = result.trim();
  }

  return result;
}

/**
 * Checks if a search term matches text using Greek-aware normalization
 * Both search term and text are normalized for comparison
 * 
 * @param searchTerm - The term to search for
 * @param text - The text to search in
 * @param options - Search options
 * @returns True if the search term matches
 * 
 * @example
 * ```typescript
 * greekSearchMatch('πορτοκαλ', 'Φρέσκα Πορτοκάλια'); // → true
 * greekSearchMatch('ΚΑΦΕΣ', 'καφές'); // → true
 * greekSearchMatch('τυρι', 'Φρέσκο Τυρί'); // → true
 * ```
 */
export function greekSearchMatch(
  searchTerm: string,
  text: string,
  options: {
    partial?: boolean;
    wholeWord?: boolean;
  } = {}
): boolean {
  const { partial = true, wholeWord = false } = options;

  if (!searchTerm || !text) {
    return false;
  }

  const normalizedSearch = greekSearchNormalize(searchTerm);
  const normalizedText = greekSearchNormalize(text);

  if (!normalizedSearch || !normalizedText) {
    return false;
  }

  if (wholeWord) {
    // Match whole words only
    const wordRegex = new RegExp(`\\b${normalizedSearch}\\b`, 'i');
    return wordRegex.test(normalizedText);
  } else if (partial) {
    // Partial match (substring)
    return normalizedText.includes(normalizedSearch);
  } else {
    // Exact match
    return normalizedText === normalizedSearch;
  }
}

/**
 * Highlights search terms in Greek text while preserving original accents
 * Returns an array of text segments with highlight information
 * 
 * @param text - The text to highlight
 * @param searchTerm - The search term to highlight
 * @param options - Highlight options
 * @returns Array of text segments with highlight flags
 * 
 * @example
 * ```typescript
 * const segments = greekSearchHighlight('Φρέσκα Πορτοκάλια', 'πορτοκαλ');
 * // → [
 * //   { text: 'Φρέσκα ', highlighted: false },
 * //   { text: 'Πορτοκάλια', highlighted: true }
 * // ]
 * ```
 */
export function greekSearchHighlight(
  text: string,
  searchTerm: string,
  options: {
    caseSensitive?: boolean;
  } = {}
): Array<{ text: string; highlighted: boolean }> {
  // const { caseSensitive = false } = options; // Currently unused but kept for future enhancement

  if (!text || !searchTerm) {
    return [{ text: text || '', highlighted: false }];
  }

  const normalizedSearch = greekSearchNormalize(searchTerm);
  const normalizedText = greekSearchNormalize(text);

  if (!normalizedSearch || !normalizedText.includes(normalizedSearch)) {
    return [{ text, highlighted: false }];
  }

  const segments: Array<{ text: string; highlighted: boolean }> = [];
  let currentIndex = 0;
  let searchIndex = normalizedText.indexOf(normalizedSearch);

  while (searchIndex !== -1) {
    // Add text before match
    if (searchIndex > currentIndex) {
      segments.push({
        text: text.substring(currentIndex, searchIndex),
        highlighted: false,
      });
    }

    // Add highlighted match
    segments.push({
      text: text.substring(searchIndex, searchIndex + normalizedSearch.length),
      highlighted: true,
    });

    currentIndex = searchIndex + normalizedSearch.length;
    searchIndex = normalizedText.indexOf(normalizedSearch, currentIndex);
  }

  // Add remaining text
  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      highlighted: false,
    });
  }

  return segments;
}

/**
 * Utility function to check if text contains Greek characters
 * 
 * @param text - Text to check
 * @returns True if text contains Greek characters
 */
export function hasGreekCharacters(text: string): boolean {
  if (!text) return false;
  
  // Greek and Coptic block in Unicode: U+0370–U+03FF
  // Greek Extended block: U+1F00–U+1FFF
  const greekRegex = /[\u0370-\u03FF\u1F00-\u1FFF]/;
  return greekRegex.test(text);
}

/**
 * Sort array of strings using Greek-aware normalization
 * 
 * @param items - Array of strings to sort
 * @param options - Sort options
 * @returns Sorted array
 */
export function greekSort<T>(
  items: T[],
  getText: (item: T) => string,
  options: {
    ascending?: boolean;
  } = {}
): T[] {
  const { ascending = true } = options;

  return items.sort((a, b) => {
    const textA = greekSearchNormalize(getText(a));
    const textB = greekSearchNormalize(getText(b));
    
    const comparison = textA.localeCompare(textB, 'el-GR');
    return ascending ? comparison : -comparison;
  });
}