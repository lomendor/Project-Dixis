/**
 * Utils Index
 * Central export file for all utility functions
 */

// Greek normalization utilities
export {
  greekNormalize,
  greekSearchNormalize,
  greekSearchMatch,
  greekSearchHighlight,
  hasGreekCharacters,
  greekSort,
} from './greekNormalize';

// Safe image utilities
export {
  validateImageUrl,
  safeImageUrl,
  responsiveImageUrl,
  generateSrcSet,
  placeholderImageUrl,
  preloadImages,
  clearImageCache,
  getImageCacheStats,
  DEFAULT_FALLBACKS,
  type ImageValidationResult,
  type SafeImageOptions,
} from './safeImage';

// Safe text utilities
export {
  safeText,
  truncateText,
  stripHtmlTags,
  sanitizeText,
  escapeHtml,
  unescapeHtml,
  normalizeWhitespace,
  createSlug,
  createTextPreview,
  validateText,
  type TruncateOptions,
  type SanitizeOptions,
} from './safeText';

// Error boundary utilities
export {
  generateErrorId,
  createEnhancedErrorInfo,
  categorizeError,
  determineErrorSeverity,
  createErrorReport,
  reportError,
  ErrorBoundaryState,
  getUserFriendlyErrorMessage,
  isRecoverableError,
  simulateError,
  createErrorHandler,
  ErrorSeverity,
  ErrorCategory,
  type ErrorInfo,
  type EnhancedErrorInfo,
  type ErrorReport,
  type ErrorBoundaryOptions,
} from './errorBoundary';