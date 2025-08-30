/**
 * Greek Text Normalization (Essential)
 * Core functions for Greek accent removal and search normalization
 */

// Greek accent removal mapping
const ACCENT_MAP: Record<string, string> = {
  'ά': 'α', 'έ': 'ε', 'ή': 'η', 'ί': 'ι', 'ό': 'ο', 'ύ': 'υ', 'ώ': 'ω',
  'Ά': 'Α', 'Έ': 'Ε', 'Ή': 'Η', 'Ί': 'Ι', 'Ό': 'Ο', 'Ύ': 'Υ', 'Ώ': 'Ω',
  'ϊ': 'ι', 'ϋ': 'υ', 'Ϊ': 'Ι', 'Ϋ': 'Υ', 'ΐ': 'ι', 'ΰ': 'υ', 'ς': 'σ'
};

/**
 * Remove Greek accents from text
 * @param text - Greek text to normalize  
 * @returns Text without accents
 */
export function greekNormalize(text: string): string {
  if (!text) return '';
  
  let normalized = text;
  for (const [accented, unaccented] of Object.entries(ACCENT_MAP)) {
    normalized = normalized.replace(new RegExp(accented, 'g'), unaccented);
  }
  return normalized;
}

/**
 * Prepare Greek text for searching
 * @param text - Text to normalize
 * @param lowercase - Convert to lowercase
 * @returns Search-ready text
 */
export function greekSearchNormalize(text: string, lowercase: boolean = true): string {
  if (!text) return '';
  
  let result = greekNormalize(text);
  if (lowercase) result = result.toLowerCase();
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Check if search term matches text using Greek normalization
 * @param searchTerm - Term to search for
 * @param text - Text to search in
 * @param partial - Allow partial matches
 * @returns True if match found
 */
export function greekSearchMatch(
  searchTerm: string,
  text: string,
  partial: boolean = true
): boolean {
  if (!searchTerm || !text) return false;
  
  const normalizedSearch = greekSearchNormalize(searchTerm);
  const normalizedText = greekSearchNormalize(text);
  
  return partial 
    ? normalizedText.includes(normalizedSearch)
    : normalizedText === normalizedSearch;
}

/**
 * Highlight search terms in text
 * @param text - Text to highlight
 * @param searchTerm - Term to highlight
 * @returns Array with highlight segments
 */
export function greekSearchHighlight(
  text: string,
  searchTerm: string
): Array<{ text: string; highlighted: boolean }> {
  if (!text || !searchTerm) {
    return [{ text: text || '', highlighted: false }];
  }

  const normalizedSearch = greekSearchNormalize(searchTerm);
  const normalizedText = greekSearchNormalize(text);
  const searchIndex = normalizedText.indexOf(normalizedSearch);
  
  if (searchIndex === -1) {
    return [{ text, highlighted: false }];
  }

  const segments = [];
  const beforeMatch = text.substring(0, searchIndex);
  const match = text.substring(searchIndex, searchIndex + normalizedSearch.length);
  const afterMatch = text.substring(searchIndex + normalizedSearch.length);

  if (beforeMatch) segments.push({ text: beforeMatch, highlighted: false });
  segments.push({ text: match, highlighted: true });
  if (afterMatch) segments.push({ text: afterMatch, highlighted: false });

  return segments;
}

/**
 * Check if text contains Greek characters
 * @param text - Text to check
 * @returns True if contains Greek characters
 */
export function hasGreekCharacters(text: string): boolean {
  return text ? /[\u0370-\u03FF]/.test(text) : false;
}

/**
 * Sort array using Greek normalization
 * @param items - Array to sort
 * @param getText - Extract text function
 * @param ascending - Sort direction
 * @returns Sorted array
 */
export function greekSort<T>(
  items: T[],
  getText: (item: T) => string,
  ascending: boolean = true
): T[] {
  return items.sort((a, b) => {
    const textA = greekSearchNormalize(getText(a));
    const textB = greekSearchNormalize(getText(b));
    const comparison = textA.localeCompare(textB, 'el-GR');
    return ascending ? comparison : -comparison;
  });
}