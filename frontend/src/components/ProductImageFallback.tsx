import React from 'react';

interface ProductImageFallbackProps {
  src?: string;
  alt: string;
  productName?: string;
  className?: string;
  priority?: boolean;
  onError?: () => void;
}

export default function ProductImageFallback({ 
  src, 
  alt, 
  productName, 
  className = '',
  priority = false,
  onError
}: ProductImageFallbackProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    // Hide the broken image
    img.style.display = 'none';
    onError?.();
  };

  const fallbackContent = (
    <div 
      className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 ${className}`}
      data-testid="image-fallback"
    >
      <svg 
        className="w-12 h-12 mb-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </svg>
      <span className="text-xs text-center px-2">
        {productName ? `${productName} - Εικόνα` : 'Δεν Υπάρχει Εικόνα'}
      </span>
    </div>
  );

  // If no source provided, show fallback immediately
  if (!src) {
    return fallbackContent;
  }

  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
        data-testid="product-image"
      />
      {/* Fallback div positioned behind image, shown when image fails */}
      <div className="absolute inset-0 opacity-0 pointer-events-none">
        {fallbackContent}
      </div>
    </div>
  );
}