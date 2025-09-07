/**
 * CartItemSkeleton Component
 * PR-88c-4: Cart UI Polish
 * 
 * Skeleton loading state for cart items
 * Provides smooth loading experience with animated placeholders
 */

import React from 'react';

interface CartItemSkeletonProps {
  count?: number;
}

export default function CartItemSkeleton({ count = 3 }: CartItemSkeletonProps) {
  return (
    <div className="space-y-4" data-testid="cart-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
          {/* Product Image Skeleton */}
          <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg animate-pulse" />

          {/* Product Details Skeleton */}
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mb-2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
          </div>

          {/* Quantity Controls Skeleton */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          </div>

          {/* Remove Button Skeleton */}
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function OrderSummarySkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6" data-testid="order-summary-skeleton">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mb-4" />
      
      {/* Shipping Info Skeleton */}
      <div className="mb-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3 mb-3" />
        <div className="space-y-3">
          <div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4 mb-2" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-full" />
          </div>
          <div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/6 mb-2" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-full" />
          </div>
        </div>
      </div>

      {/* Order Totals Skeleton */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
        </div>
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
          </div>
        </div>
      </div>

      {/* Checkout Button Skeleton */}
      <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-full mb-4" />
      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3 mx-auto" />
    </div>
  );
}