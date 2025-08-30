/**
 * Safe Image Utilities
 * Functions for validating image URLs and providing fallbacks
 */

import { apiUrl } from '@/env';

/**
 * Image validation result interface
 */
export interface ImageValidationResult {
  isValid: boolean;
  url: string;
  error?: string;
}

/**
 * Configuration for image validation and fallbacks
 */
export interface SafeImageOptions {
  fallbackUrl?: string;
  maxWidth?: number;
  maxHeight?: number;
  timeout?: number;
  validateDimensions?: boolean;
  allowedFormats?: string[];
  placeholder?: string;
}

/**
 * Default fallback images for different contexts
 */
export const DEFAULT_FALLBACKS = {
  product: '/images/placeholder-product.jpg',
  avatar: '/images/placeholder-avatar.jpg',
  category: '/images/placeholder-category.jpg',
  producer: '/images/placeholder-producer.jpg',
  banner: '/images/placeholder-banner.jpg',
  generic: '/images/placeholder.jpg',
} as const;

/**
 * Cache for image validation results to avoid repeated checks
 */
const imageValidationCache = new Map<string, ImageValidationResult>();

/**
 * Validates if an image URL exists and is accessible
 * Uses fetch with HEAD request to check without downloading the full image
 * 
 * @param url - Image URL to validate
 * @param options - Validation options
 * @returns Promise with validation result
 * 
 * @example
 * ```typescript
 * const result = await validateImageUrl('https://example.com/image.jpg');
 * if (result.isValid) {
 *   // Use the image
 * } else {
 *   // Use fallback
 * }
 * ```
 */
export async function validateImageUrl(
  url: string | null | undefined,
  options: SafeImageOptions = {}
): Promise<ImageValidationResult> {
  const { timeout = 5000, allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'] } = options;

  // Handle null/undefined/empty URLs
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      url: options.fallbackUrl || DEFAULT_FALLBACKS.generic,
      error: 'Invalid URL provided',
    };
  }

  // Check cache first
  if (imageValidationCache.has(url)) {
    return imageValidationCache.get(url)!;
  }

  try {
    // Validate URL format
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url);
    } catch {
      // Try relative URL with API base
      try {
        validatedUrl = new URL(apiUrl(url));
      } catch {
        const result: ImageValidationResult = {
          isValid: false,
          url: options.fallbackUrl || DEFAULT_FALLBACKS.generic,
          error: 'Invalid URL format',
        };
        imageValidationCache.set(url, result);
        return result;
      }
    }

    // Check file extension if format validation is enabled
    if (allowedFormats.length > 0) {
      const pathname = validatedUrl.pathname.toLowerCase();
      const hasValidExtension = allowedFormats.some(format => 
        pathname.endsWith(`.${format}`)
      );
      
      if (!hasValidExtension && !pathname.includes('data:image/')) {
        const result: ImageValidationResult = {
          isValid: false,
          url: options.fallbackUrl || DEFAULT_FALLBACKS.generic,
          error: `Unsupported format. Allowed: ${allowedFormats.join(', ')}`,
        };
        imageValidationCache.set(url, result);
        return result;
      }
    }

    // Use fetch with HEAD method to check if image exists
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(validatedUrl.toString(), {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const result: ImageValidationResult = {
        isValid: false,
        url: options.fallbackUrl || DEFAULT_FALLBACKS.generic,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
      imageValidationCache.set(url, result);
      return result;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.startsWith('image/')) {
      const result: ImageValidationResult = {
        isValid: false,
        url: options.fallbackUrl || DEFAULT_FALLBACKS.generic,
        error: `Invalid content type: ${contentType}`,
      };
      imageValidationCache.set(url, result);
      return result;
    }

    // Success
    const result: ImageValidationResult = {
      isValid: true,
      url: validatedUrl.toString(),
    };
    imageValidationCache.set(url, result);
    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    const result: ImageValidationResult = {
      isValid: false,
      url: options.fallbackUrl || DEFAULT_FALLBACKS.generic,
      error: errorMessage,
    };
    imageValidationCache.set(url, result);
    return result;
  }
}

/**
 * Synchronously returns a safe image URL with immediate fallback
 * For use in React components where you need an immediate result
 * 
 * @param url - Image URL to make safe
 * @param fallbackUrl - Fallback URL to use if main URL is invalid
 * @returns Safe URL to use
 * 
 * @example
 * ```typescript
 * const safeUrl = safeImageUrl(product.image_url, DEFAULT_FALLBACKS.product);
 * // Always returns a usable URL
 * ```
 */
export function safeImageUrl(
  url: string | null | undefined, 
  fallbackUrl: string = DEFAULT_FALLBACKS.generic
): string {
  if (!url || typeof url !== 'string') {
    return fallbackUrl;
  }

  // Handle data URLs
  if (url.startsWith('data:image/')) {
    return url;
  }

  try {
    // Try to create URL to validate format
    new URL(url);
    return url;
  } catch {
    // Try relative URL with API base
    try {
      return apiUrl(url);
    } catch {
      return fallbackUrl;
    }
  }
}

/**
 * Creates a responsive image URL with size parameters
 * Useful for APIs that support dynamic image resizing
 * 
 * @param url - Base image URL
 * @param width - Desired width
 * @param height - Desired height
 * @param options - Additional options
 * @returns URL with size parameters
 */
export function responsiveImageUrl(
  url: string | null | undefined,
  width?: number,
  height?: number,
  options: {
    quality?: number;
    format?: 'jpg' | 'webp' | 'png';
    fallback?: string;
  } = {}
): string {
  const safeUrl = safeImageUrl(url, options.fallback);
  
  // If no dimensions specified, return as-is
  if (!width && !height) {
    return safeUrl;
  }

  try {
    const urlObj = new URL(safeUrl);
    
    if (width) urlObj.searchParams.set('w', width.toString());
    if (height) urlObj.searchParams.set('h', height.toString());
    if (options.quality) urlObj.searchParams.set('q', options.quality.toString());
    if (options.format) urlObj.searchParams.set('f', options.format);
    
    return urlObj.toString();
  } catch {
    return safeUrl;
  }
}

/**
 * Generates srcSet for responsive images
 * Creates multiple image URLs with different sizes
 * 
 * @param url - Base image URL
 * @param sizes - Array of sizes to generate
 * @returns srcSet string for img element
 * 
 * @example
 * ```typescript
 * const srcSet = generateSrcSet('/image.jpg', [320, 640, 1024]);
 * // Returns: "/image.jpg?w=320 320w, /image.jpg?w=640 640w, /image.jpg?w=1024 1024w"
 * ```
 */
export function generateSrcSet(
  url: string | null | undefined,
  sizes: number[] = [320, 640, 1024, 1280]
): string {
  const safeUrl = safeImageUrl(url);
  
  return sizes
    .map(size => `${responsiveImageUrl(safeUrl, size)} ${size}w`)
    .join(', ');
}

/**
 * Creates a placeholder image URL with specified dimensions and text
 * Useful for generating placeholder images during development
 * 
 * @param width - Image width
 * @param height - Image height
 * @param text - Placeholder text
 * @param options - Additional options
 * @returns Placeholder image URL
 */
export function placeholderImageUrl(
  width: number = 300,
  height: number = 200,
  text: string = 'Placeholder',
  options: {
    backgroundColor?: string;
    textColor?: string;
    format?: 'jpg' | 'png';
  } = {}
): string {
  const {
    backgroundColor = 'cccccc',
    textColor = '666666',
    format = 'jpg'
  } = options;

  // Use a placeholder service (you can replace with your preferred service)
  return `https://via.placeholder.com/${width}x${height}/${backgroundColor}/${textColor}.${format}?text=${encodeURIComponent(text)}`;
}

/**
 * Preloads images to improve performance
 * Returns promises that resolve when images are loaded
 * 
 * @param urls - Array of image URLs to preload
 * @param options - Preload options
 * @returns Array of promises for each image
 * 
 * @example
 * ```typescript
 * const imageUrls = products.map(p => p.image_url);
 * await preloadImages(imageUrls);
 * // All images are now cached
 * ```
 */
export function preloadImages(
  urls: (string | null | undefined)[],
  options: {
    timeout?: number;
    validateFirst?: boolean;
  } = {}
): Promise<void>[] {
  const { timeout = 10000, validateFirst = false } = options;

  return urls
    .filter((url): url is string => Boolean(url))
    .map(async (url) => {
      try {
        // Validate first if requested
        if (validateFirst) {
          const validation = await validateImageUrl(url, { timeout });
          if (!validation.isValid) {
            throw new Error(validation.error);
          }
        }

        // Create image element to trigger loading
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          const timeoutId = setTimeout(() => {
            reject(new Error('Image preload timeout'));
          }, timeout);

          img.onload = () => {
            clearTimeout(timeoutId);
            resolve();
          };

          img.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error('Image failed to load'));
          };

          img.src = safeImageUrl(url);
        });
      } catch (error) {
        // Return rejected promise
        return Promise.reject(error);
      }
    });
}

/**
 * Clears the image validation cache
 * Useful for testing or when you want to revalidate images
 */
export function clearImageCache(): void {
  imageValidationCache.clear();
}

/**
 * Gets cache statistics for debugging
 */
export function getImageCacheStats(): {
  size: number;
  validImages: number;
  invalidImages: number;
} {
  let validImages = 0;
  let invalidImages = 0;

  const results = Array.from(imageValidationCache.values());
  for (const result of results) {
    if (result.isValid) {
      validImages++;
    } else {
      invalidImages++;
    }
  }

  return {
    size: imageValidationCache.size,
    validImages,
    invalidImages,
  };
}