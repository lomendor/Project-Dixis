/**
 * Safe Text Utilities
 * Functions for text sanitization, truncation, and safe handling
 */

import { greekNormalize } from './greekNormalize';

/**
 * Text truncation options
 */
export interface TruncateOptions {
  length: number;
  suffix?: string;
  preserveWords?: boolean;
  stripHtml?: boolean;
}

/**
 * Text sanitization options
 */
export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  maxLength?: number;
  truncateOptions?: TruncateOptions;
}

/**
 * Safely handles null, undefined, or invalid text values
 * Returns empty string for invalid inputs
 * 
 * @param text - Text to make safe
 * @param fallback - Fallback value for invalid inputs
 * @returns Safe text string
 * 
 * @example
 * ```typescript
 * safeText(null); // → ''
 * safeText(undefined, 'N/A'); // → 'N/A'
 * safeText(123); // → '123'
 * safeText('  hello  '); // → 'hello'
 * ```
 */
export function safeText(
  text: unknown,
  fallback: string = ''
): string {
  if (text === null || text === undefined) {
    return fallback;
  }

  if (typeof text === 'string') {
    return text.trim();
  }

  if (typeof text === 'number' || typeof text === 'boolean') {
    return String(text);
  }

  // For objects, arrays, etc., return fallback
  return fallback;
}

/**
 * Truncates text to a specified length with ellipsis
 * Supports word-boundary preservation and HTML stripping
 * 
 * @param text - Text to truncate
 * @param options - Truncation options
 * @returns Truncated text
 * 
 * @example
 * ```typescript
 * truncateText('This is a long sentence', { length: 10 }); // → 'This is a...'
 * truncateText('Word boundary test', { length: 10, preserveWords: true }); // → 'Word...'
 * truncateText('<p>HTML content</p>', { length: 20, stripHtml: true }); // → 'HTML content'
 * ```
 */
export function truncateText(
  text: string | null | undefined,
  options: TruncateOptions
): string {
  const {
    length,
    suffix = '...',
    preserveWords = false,
    stripHtml = false,
  } = options;

  const safeInput = safeText(text);
  if (!safeInput) return '';

  let processedText = safeInput;

  // Strip HTML if requested
  if (stripHtml) {
    processedText = stripHtmlTags(processedText);
  }

  // No truncation needed
  if (processedText.length <= length) {
    return processedText;
  }

  // Simple truncation
  if (!preserveWords) {
    return processedText.substring(0, length - suffix.length) + suffix;
  }

  // Word-boundary truncation
  const truncated = processedText.substring(0, length - suffix.length);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex === -1) {
    // No spaces found, use simple truncation
    return truncated + suffix;
  }

  return truncated.substring(0, lastSpaceIndex) + suffix;
}

/**
 * Strips HTML tags from text while preserving content
 * More secure than innerHTML manipulation
 * 
 * @param html - HTML string to strip
 * @param preserveWhitespace - Whether to preserve whitespace formatting
 * @returns Plain text content
 * 
 * @example
 * ```typescript
 * stripHtmlTags('<p>Hello <strong>world</strong>!</p>'); // → 'Hello world!'
 * stripHtmlTags('<div>Line 1<br>Line 2</div>', true); // → 'Line 1\nLine 2'
 * ```
 */
export function stripHtmlTags(
  html: string | null | undefined,
  preserveWhitespace: boolean = false
): string {
  const safeInput = safeText(html);
  if (!safeInput) return '';

  let text = safeInput;

  // Convert common block elements to newlines if preserving whitespace
  if (preserveWhitespace) {
    text = text
      .replace(/<(br|BR)\s*\/?>/g, '\n')
      .replace(/<\/(div|DIV|p|P|h[1-6]|H[1-6])\s*>/g, '\n')
      .replace(/<(div|DIV|p|P|h[1-6]|H[1-6])[^>]*>/g, '\n');
  }

  // Remove all HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Clean up whitespace
  if (preserveWhitespace) {
    // Normalize line breaks but preserve structure
    text = text.replace(/\n\s*\n/g, '\n\n').trim();
  } else {
    // Collapse all whitespace
    text = text.replace(/\s+/g, ' ').trim();
  }

  return text;
}

/**
 * Sanitizes text content by removing/escaping dangerous characters
 * Prevents XSS and other injection attacks
 * 
 * @param text - Text to sanitize
 * @param options - Sanitization options
 * @returns Sanitized text
 * 
 * @example
 * ```typescript
 * sanitizeText('<script>alert("xss")</script>Hello'); // → 'Hello'
 * sanitizeText('Normal text with "quotes"'); // → 'Normal text with "quotes"'
 * ```
 */
export function sanitizeText(
  text: string | null | undefined,
  options: SanitizeOptions = {}
): string {
  const {
    allowedTags = [],
    maxLength,
    truncateOptions,
  } = options;

  let safeInput = safeText(text);
  if (!safeInput) return '';

  // Remove or escape script tags and dangerous content
  safeInput = safeInput
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers

  // If no tags are allowed, strip all HTML
  if (allowedTags.length === 0) {
    safeInput = stripHtmlTags(safeInput);
  } else {
    // Remove non-allowed tags (simplified approach)
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    safeInput = safeInput.replace(tagRegex, (match, tagName) => {
      if (allowedTags.includes(tagName.toLowerCase())) {
        return match;
      }
      return '';
    });
  }

  // Apply truncation if specified
  if (maxLength && truncateOptions) {
    safeInput = truncateText(safeInput, {
      ...truncateOptions,
      length: maxLength,
    });
  }

  return safeInput;
}

/**
 * Escapes HTML entities in text
 * Useful when you need to display user input as-is
 * 
 * @param text - Text to escape
 * @returns HTML-escaped text
 * 
 * @example
 * ```typescript
 * escapeHtml('<div>Hello & "world"</div>'); // → '&lt;div&gt;Hello &amp; &quot;world&quot;&lt;/div&gt;'
 * ```
 */
export function escapeHtml(text: string | null | undefined): string {
  const safeInput = safeText(text);
  if (!safeInput) return '';

  return safeInput
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Unescapes HTML entities
 * Converts escaped HTML back to regular characters
 * 
 * @param text - HTML-escaped text
 * @returns Unescaped text
 */
export function unescapeHtml(text: string | null | undefined): string {
  const safeInput = safeText(text);
  if (!safeInput) return '';

  return safeInput
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&'); // Must be last
}

/**
 * Normalizes whitespace in text
 * Removes extra spaces, tabs, and line breaks
 * 
 * @param text - Text to normalize
 * @param options - Normalization options
 * @returns Normalized text
 */
export function normalizeWhitespace(
  text: string | null | undefined,
  options: {
    preserveLineBreaks?: boolean;
    maxConsecutiveSpaces?: number;
  } = {}
): string {
  const {
    preserveLineBreaks = false,
    maxConsecutiveSpaces = 1,
  } = options;

  const safeInput = safeText(text);
  if (!safeInput) return '';

  let normalized = safeInput;

  if (preserveLineBreaks) {
    // Normalize spaces but keep line breaks
    normalized = normalized
      .replace(/[^\S\n]+/g, ' ') // Replace all non-newline whitespace with single spaces
      .replace(new RegExp(` {${maxConsecutiveSpaces + 1},}`, 'g'), ' '.repeat(maxConsecutiveSpaces));
  } else {
    // Normalize all whitespace
    normalized = normalized
      .replace(/\s+/g, ' ')
      .trim();
  }

  return normalized;
}

/**
 * Creates a slug from text (URL-friendly version)
 * Handles Greek text normalization for better URLs
 * 
 * @param text - Text to convert to slug
 * @param options - Slug options
 * @returns URL-friendly slug
 * 
 * @example
 * ```typescript
 * createSlug('Φρέσκα Πορτοκάλια!'); // → 'φρεσκα-πορτοκαλια'
 * createSlug('Hello World 123'); // → 'hello-world-123'
 * ```
 */
export function createSlug(
  text: string | null | undefined,
  options: {
    maxLength?: number;
    separator?: string;
    lowercase?: boolean;
  } = {}
): string {
  const {
    maxLength = 100,
    separator = '-',
    lowercase = true,
  } = options;

  const safeInput = safeText(text);
  if (!safeInput) return '';

  let slug = safeInput;

  // Normalize Greek text
  slug = greekNormalize(slug);

  // Convert to lowercase if requested
  if (lowercase) {
    slug = slug.toLowerCase();
  }

  // Remove HTML tags
  slug = stripHtmlTags(slug);

  // Replace non-alphanumeric characters with separator
  slug = slug
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, separator) // Replace spaces and underscores with separator
    .replace(new RegExp(`${separator}+`, 'g'), separator); // Remove consecutive separators

  // Remove leading/trailing separators
  slug = slug.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');

  // Truncate if necessary
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Remove trailing separator after truncation
    slug = slug.replace(new RegExp(`${separator}+$`), '');
  }

  return slug;
}

/**
 * Extracts plain text preview from rich content
 * Useful for generating meta descriptions or previews
 * 
 * @param content - Rich content (HTML, markdown, etc.)
 * @param length - Maximum length of preview
 * @returns Plain text preview
 */
export function createTextPreview(
  content: string | null | undefined,
  length: number = 160
): string {
  const safeInput = safeText(content);
  if (!safeInput) return '';

  // Strip HTML and normalize whitespace
  let preview = stripHtmlTags(safeInput);
  preview = normalizeWhitespace(preview);

  // Truncate with word boundaries
  return truncateText(preview, {
    length,
    preserveWords: true,
    suffix: '...',
  });
}

/**
 * Validates if text meets certain criteria
 * Useful for form validation and content guidelines
 * 
 * @param text - Text to validate
 * @param rules - Validation rules
 * @returns Validation result with errors
 */
export function validateText(
  text: string | null | undefined,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    allowHtml?: boolean;
    pattern?: RegExp;
    customValidator?: (text: string) => string | null;
  }
): {
  isValid: boolean;
  errors: string[];
} {
  const {
    required = false,
    minLength,
    maxLength,
    allowHtml = false,
    pattern,
    customValidator,
  } = rules;

  const errors: string[] = [];
  const safeInput = safeText(text);

  // Check required
  if (required && !safeInput) {
    errors.push('Text is required');
    return { isValid: false, errors };
  }

  // If not required and empty, it's valid
  if (!safeInput) {
    return { isValid: true, errors: [] };
  }

  // Check HTML
  if (!allowHtml && /<[^>]*>/g.test(safeInput)) {
    errors.push('HTML tags are not allowed');
  }

  // Check length
  const textLength = allowHtml ? stripHtmlTags(safeInput).length : safeInput.length;

  if (minLength !== undefined && textLength < minLength) {
    errors.push(`Text must be at least ${minLength} characters long`);
  }

  if (maxLength !== undefined && textLength > maxLength) {
    errors.push(`Text must not exceed ${maxLength} characters`);
  }

  // Check pattern
  if (pattern && !pattern.test(safeInput)) {
    errors.push('Text does not match required format');
  }

  // Custom validation
  if (customValidator) {
    const customError = customValidator(safeInput);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}