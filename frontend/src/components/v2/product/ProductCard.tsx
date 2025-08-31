'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import OptimizedImage from '@/components/performance/OptimizedImage';
import { ScreenReaderOnly } from '@/components/accessibility/ScreenReaderHelper';
import { useMotionSafeClasses } from '@/hooks/useReducedMotion';
import { useRenderPerformance } from '@/hooks/usePerformance';

interface Product {
  id: number;
  name: string;
  price: string;
  unit: string;
  stock?: number | null;
  description?: string;
  images: Array<{
    url?: string;
    image_path?: string;
    alt_text?: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
  }>;
  producer: {
    id: number;
    name: string;
    business_name?: string;
  };
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => Promise<void>;
  addingToCart?: boolean;
  priority?: boolean;
  className?: string;
}

/**
 * Optimized and accessible product card component
 * Features: lazy loading, proper ARIA labels, keyboard navigation,
 * reduced motion support, and performance tracking
 */
export default function ProductCard({
  product,
  onAddToCart,
  addingToCart = false,
  priority = false,
  className = ''
}: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const motionClasses = useMotionSafeClasses();
  
  // Track render performance in development
  useRenderPerformance(`ProductCard-${product.id}`);

  const handleAddToCart = useCallback(async () => {
    if (product.stock === 0 || addingToCart) return;
    
    try {
      await onAddToCart(product.id);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  }, [product.id, product.stock, addingToCart, onAddToCart]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter and Space on the card for keyboard users
    if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
      e.preventDefault();
      // Navigate to product detail page
      window.location.href = `/products/${product.id}`;
    }
  };

  const isOutOfStock = product.stock === 0;
  const imageUrl = product.images[0]?.url || product.images[0]?.image_path;
  const imageAlt = product.images[0]?.alt_text || `${product.name} - product image`;
  const producerName = product.producer.name || product.producer.business_name;
  
  // Generate structured data for the product
  const productJsonLd = {
    '@type': 'Product',
    name: product.name,
    image: imageUrl,
    description: product.description || `Fresh ${product.name} from ${producerName}`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability: isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: producerName,
      },
    },
    brand: {
      '@type': 'Brand',
      name: producerName,
    },
    category: product.categories[0]?.name || 'Fresh Produce',
  };

  return (
    <article
      className={`bg-white rounded-lg shadow-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${motionClasses.transition} hover:shadow-lg ${className}`}
      data-testid="product-card"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="article"
      aria-labelledby={`product-title-${product.id}`}
      aria-describedby={`product-price-${product.id} product-producer-${product.id}`}
    >
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />

      {/* Product Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {imageUrl ? (
          <OptimizedImage
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={priority}
            aspectRatio="16/9"
            onLoadComplete={() => setIsImageLoaded(true)}
            data-testid="product-image"
          />
        ) : (
          <div 
            className="flex items-center justify-center text-gray-400 text-sm h-full"
            role="img" 
            aria-label="No image available"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <ScreenReaderOnly>No image available for {product.name}</ScreenReaderOnly>
          </div>
        )}
        
        {/* Stock status overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <header className="mb-2">
          <h3 
            id={`product-title-${product.id}`}
            className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1"
            data-testid="product-title"
          >
            {product.name}
          </h3>
          
          <p 
            id={`product-producer-${product.id}`}
            className="text-sm text-gray-600"
          >
            By {producerName}
            <ScreenReaderOnly>, producer</ScreenReaderOnly>
          </p>
        </header>
        
        {/* Price and Stock Info */}
        <div className="flex items-center justify-between mb-4">
          <div id={`product-price-${product.id}`}>
            <span 
              className="text-xl font-bold text-green-600"
              data-testid="product-price"
              aria-label={`Price: ${product.price} euros per ${product.unit}`}
            >
              €{product.price}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              / {product.unit}
            </span>
          </div>
          
          {product.stock !== null && !isOutOfStock && (
            <span className="text-sm text-gray-500">
              <ScreenReaderOnly>Stock available: </ScreenReaderOnly>
              {product.stock} left
            </span>
          )}
        </div>

        {/* Categories */}
        {product.categories.length > 0 && (
          <div className="mb-4" aria-label="Product categories">
            <ScreenReaderOnly>Categories:</ScreenReaderOnly>
            <div className="flex flex-wrap gap-1">
              {product.categories.slice(0, 2).map((category) => (
                <span
                  key={category.id}
                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                  aria-label={`Category: ${category.name}`}
                >
                  {category.name}
                </span>
              ))}
              {product.categories.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  <ScreenReaderOnly>And</ScreenReaderOnly>
                  +{product.categories.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/products/${product.id}`}
            className={`flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${motionClasses.transition}`}
            aria-label={`View details for ${product.name}`}
          >
            View Details
          </Link>
          
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || addingToCart}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${motionClasses.transition} ${
              isOutOfStock || addingToCart
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
            }`}
            data-testid="add-to-cart"
            aria-label={
              isOutOfStock 
                ? `${product.name} is out of stock`
                : addingToCart 
                  ? `Adding ${product.name} to cart`
                  : `Add ${product.name} to cart`
            }
            aria-describedby={`product-price-${product.id}`}
          >
            {isOutOfStock 
              ? 'Out of Stock' 
              : addingToCart 
                ? (
                  <>
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                        <path fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                      </svg>
                      Adding...
                    </span>
                  </>
                )
                : 'Add to Cart'
            }
          </button>
        </div>
      </div>
    </article>
  );
}