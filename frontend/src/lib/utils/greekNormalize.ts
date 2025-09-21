'use client';

/**
 * Greek Text Normalization Utility
 * 
 * Handles intelligent Greek text normalization for search functionality:
 * - Case insensitive: "Πορτοκάλια" = "πορτοκάλια" = "ΠΟΡΤΟΚΑΛΙΑ"
 * - Accent removal: "πορτοκάλια" = "πορτοκαλια" (remove άλια → αλια)
 * - Transliteration: "portokalia" = "πορτοκάλια" (Latin → Greek)
 * - Combined search: All variants return identical results
 */

// Greek to Latin character mapping for transliteration
const greekToLatinMap: Record<string, string> = {
  'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'h', 'θ': 'th',
  'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p',
  'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'u', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o',
  // Accented characters
  'ά': 'a', 'έ': 'e', 'ή': 'h', 'ί': 'i', 'ό': 'o', 'ύ': 'u', 'ώ': 'o',
  // Diphthongs and combinations
  'αι': 'ai', 'ει': 'ei', 'οι': 'oi', 'υι': 'ui', 'αυ': 'au', 'ευ': 'eu', 'ου': 'ou'
};

// Latin to Greek character mapping (reverse transliteration)
const latinToGreekMap: Record<string, string> = {
  'a': 'α', 'b': 'β', 'g': 'γ', 'd': 'δ', 'e': 'ε', 'z': 'ζ', 'h': 'η',
  'i': 'ι', 'k': 'κ', 'l': 'λ', 'm': 'μ', 'n': 'ν', 'x': 'ξ', 'o': 'ο', 'p': 'π',
  'r': 'ρ', 's': 'σ', 't': 'τ', 'u': 'υ', 'f': 'φ', 'w': 'ω',
  // Special combinations (order matters - longer first)
  'th': 'θ', 'ch': 'χ', 'ps': 'ψ',
  // Diphthongs
  'ai': 'αι', 'ei': 'ει', 'oi': 'οι', 'ui': 'υι', 'au': 'αυ', 'eu': 'ευ', 'ou': 'ου'
};

// Greek accent mapping for removal
const greekAccentMap: Record<string, string> = {
  'ά': 'α', 'έ': 'ε', 'ή': 'η', 'ί': 'ι', 'ό': 'ο', 'ύ': 'υ', 'ώ': 'ω',
  'Ά': 'Α', 'Έ': 'Ε', 'Ή': 'Η', 'Ί': 'Ι', 'Ό': 'Ο', 'Ύ': 'Υ', 'Ώ': 'Ω',
  'ΐ': 'ι', 'ΰ': 'υ', 'Ϊ': 'Ι', 'Ϋ': 'Υ'
};

/**
 * Remove Greek accents from text
 */
export const removeGreekAccents = (text: string): string => {
  return text.split('').map(char => greekAccentMap[char] || char).join('');
};

/**
 * Convert Greek characters to Latin transliteration
 */
export const greekToLatin = (text: string): string => {
  const normalized = removeGreekAccents(text.toLowerCase());
  
  // Handle multi-character combinations first (th, ch, ps)
  const result = normalized
    .replace(/θ/g, 'th')
    .replace(/χ/g, 'ch') 
    .replace(/ψ/g, 'ps')
    // Handle diphthongs
    .replace(/αι/g, 'ai')
    .replace(/ει/g, 'ei')
    .replace(/οι/g, 'oi')
    .replace(/υι/g, 'ui')
    .replace(/αυ/g, 'au')
    .replace(/ευ/g, 'eu')
    .replace(/ου/g, 'ou');
  
  // Then handle single characters
  return result.split('').map(char => greekToLatinMap[char] || char).join('');
};

/**
 * Convert Latin characters to Greek (reverse transliteration)
 * Attempts to convert Latin text that might be Greek words written in Latin script
 */
export const latinToGreek = (text: string): string => {
  const lowercase = text.toLowerCase();
  
  // Handle multi-character combinations first (order matters - longer first)
  const result = lowercase
    .replace(/th/g, 'θ')
    .replace(/ch/g, 'χ')
    .replace(/ps/g, 'ψ')
    // Handle diphthongs
    .replace(/ai/g, 'αι')
    .replace(/ei/g, 'ει')
    .replace(/oi/g, 'οι')
    .replace(/ui/g, 'υι')
    .replace(/au/g, 'αυ')
    .replace(/eu/g, 'ευ')
    .replace(/ou/g, 'ου');
  
  // Then handle single characters
  return result.split('').map(char => latinToGreekMap[char] || char).join('');
};

/**
 * Check if text contains Greek characters
 */
export const hasGreekCharacters = (text: string): boolean => {
  return /[\u0370-\u03FF\u1F00-\u1FFF]/.test(text);
};

/**
 * Check if text contains Latin characters (basic ASCII)
 */
export const hasLatinCharacters = (text: string): boolean => {
  return /[a-zA-Z]/.test(text);
};

/**
 * Core Greek text normalization function
 * Returns a normalized version for comparison and an array of variants for search
 */
export const greekNormalize = (text: string): {
  normalized: string;
  variants: string[];
} => {
  if (!text || typeof text !== 'string') {
    return { normalized: '', variants: [] };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { normalized: '', variants: [] };
  }

  // Base normalization: lowercase, remove accents, remove non-alphanumeric
  const baseNormalized = removeGreekAccents(trimmed.toLowerCase())
    .replace(/[^\w\sα-ωάέήίόύώ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const variants = new Set<string>([baseNormalized]);

  // Generate transliteration variants
  if (hasGreekCharacters(baseNormalized)) {
    // Greek to Latin transliteration
    const latinVariant = greekToLatin(baseNormalized);
    if (latinVariant !== baseNormalized) {
      variants.add(latinVariant);
    }
  }

  if (hasLatinCharacters(trimmed) && !hasGreekCharacters(trimmed)) {
    // Latin to Greek transliteration (for input like "portokalia")
    const greekVariant = latinToGreek(baseNormalized);
    if (greekVariant !== baseNormalized) {
      variants.add(greekVariant);
      // Also add the accent-removed version of the Greek variant
      variants.add(removeGreekAccents(greekVariant));
    }
  }

  // Remove empty variants and sort by length (shorter first for better matching)
  const filteredVariants = Array.from(variants)
    .filter(v => v.length > 0)
    .sort((a, b) => a.length - b.length);

  return {
    normalized: baseNormalized,
    variants: filteredVariants
  };
};

/**
 * Check if two texts match when normalized (Greek-aware comparison)
 */
export const greekTextMatches = (text1: string, text2: string): boolean => {
  const norm1 = greekNormalize(text1);
  const norm2 = greekNormalize(text2);
  
  // Check if any variant of text1 matches any variant of text2
  return norm1.variants.some(v1 => 
    norm2.variants.some(v2 => v1 === v2)
  );
};

/**
 * Find if any of the normalized variants of the query match within the target text
 */
export const greekTextContains = (targetText: string, query: string): boolean => {
  const target = greekNormalize(targetText);
  const queryNorm = greekNormalize(query);
  
  // Check if any query variant is contained in any target variant
  return target.variants.some(targetVariant =>
    queryNorm.variants.some(queryVariant =>
      targetVariant.includes(queryVariant)
    )
  );
};

/**
 * Enhanced search utility that supports Greek normalization
 * Usage: greekSearch('πορτοκάλια', ['Πορτοκάλια Κρήτης', 'portokalia fresh', 'Μήλα'])
 * Returns: ['Πορτοκάλια Κρήτης', 'portokalia fresh']
 */
export const greekSearch = <T>(
  query: string, 
  items: T[], 
  textExtractor: (item: T) => string
): T[] => {
  if (!query || !items.length) return [];
  
  const queryNorm = greekNormalize(query);
  
  return items.filter(item => {
    const itemText = textExtractor(item);
    return greekTextContains(itemText, query);
  });
};

/**
 * Get all possible search terms from a Greek text for comprehensive indexing
 * Useful for creating search indices that work with all variants
 */
export const getSearchTerms = (text: string): string[] => {
  if (!text) return [];
  
  const words = text.split(/\s+/).filter(word => word.length > 1);
  const allTerms = new Set<string>();
  
  words.forEach(word => {
    const { variants } = greekNormalize(word);
    variants.forEach(variant => allTerms.add(variant));
  });
  
  return Array.from(allTerms);
};

export default greekNormalize;