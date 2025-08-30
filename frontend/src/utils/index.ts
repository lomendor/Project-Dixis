/**
 * Utils Index
 * Core utility functions for Project Dixis
 */

// Greek normalization utilities
export {
  greekNormalize,
  greekSearchNormalize,
  greekSearchMatch,
  hasGreekCharacters,
} from './greekNormalize';

// Safe text utilities  
export {
  safeText,
  truncateText,
  stripHtmlTags,
  sanitizeText,
  escapeHtml,
} from './safeText';