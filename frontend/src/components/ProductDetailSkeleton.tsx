import React from 'react';

interface ProductDetailSkeletonProps {
  className?: string;
}

export default function ProductDetailSkeleton({ className = '' }: ProductDetailSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`} data-testid="product-detail-skeleton">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Skeleton */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-200 rounded-lg"></div>
          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>

          {/* Producer Info */}
          <div className="border-t pt-6">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="h-5 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="flex flex-wrap gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-full w-16"></div>
              ))}
            </div>
          </div>

          {/* Add to Cart Section */}
          <div className="border-t pt-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-10 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}