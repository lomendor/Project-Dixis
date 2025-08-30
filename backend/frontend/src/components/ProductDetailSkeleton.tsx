interface ProductDetailSkeletonProps {
  showBackButton?: boolean;
}

export default function ProductDetailSkeleton({ showBackButton = true }: ProductDetailSkeletonProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button Skeleton */}
      {showBackButton && (
        <div className="mb-6">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section Skeleton */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
          
          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="space-y-6">
          {/* Title & Price */}
          <div>
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            
            {/* Description */}
            <div className="space-y-2 mb-6">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>

          {/* Producer Info Skeleton */}
          <div className="border-t pt-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Categories Skeleton */}
          <div>
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Add to Cart Section Skeleton */}
          <div className="border-t pt-6">
            <div className="mb-4">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}