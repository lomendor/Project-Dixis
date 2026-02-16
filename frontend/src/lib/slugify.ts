/**
 * Greek-to-Latin transliteration map for URL slug generation.
 * Covers all Greek letters including accented forms.
 */
const GREEK_TO_LATIN: Record<string, string> = {
  // Lowercase
  'α': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z',
  'η': 'i', 'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm',
  'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's',
  'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps',
  'ω': 'o',
  // Uppercase
  'Α': 'a', 'Β': 'v', 'Γ': 'g', 'Δ': 'd', 'Ε': 'e', 'Ζ': 'z',
  'Η': 'i', 'Θ': 'th', 'Ι': 'i', 'Κ': 'k', 'Λ': 'l', 'Μ': 'm',
  'Ν': 'n', 'Ξ': 'x', 'Ο': 'o', 'Π': 'p', 'Ρ': 'r', 'Σ': 's',
  'Τ': 't', 'Υ': 'y', 'Φ': 'f', 'Χ': 'ch', 'Ψ': 'ps', 'Ω': 'o',
  // Accented lowercase
  'ά': 'a', 'έ': 'e', 'ή': 'i', 'ί': 'i', 'ό': 'o', 'ύ': 'y',
  'ώ': 'o', 'ϊ': 'i', 'ϋ': 'y', 'ΐ': 'i', 'ΰ': 'y',
  // Accented uppercase
  'Ά': 'a', 'Έ': 'e', 'Ή': 'i', 'Ί': 'i', 'Ό': 'o', 'Ύ': 'y',
  'Ώ': 'o', 'Ϊ': 'i', 'Ϋ': 'y',
};

/**
 * Convert a Greek (or mixed) string to a URL-safe slug.
 * "Βιολογικές Ντομάτες Κρήτης" → "viologikes-ntomates-kritis"
 */
export function greekToSlug(text: string): string {
  return text
    .split('')
    .map((char) => GREEK_TO_LATIN[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/\s+/g, '-')       // spaces → dashes
    .replace(/[^a-z0-9-]/g, '') // remove non-alphanumeric
    .replace(/-+/g, '-')        // collapse multiple dashes
    .replace(/^-|-$/g, '');     // trim leading/trailing dashes
}
