export default function ProductDetailLoading() {
  return (
    <main className="container mx-auto px-4 py-6" data-testid="product-detail-skeleton">
      {/* Breadcrumb Skeleton */}
      <nav className="mb-6 flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        <span className="text-gray-400">/</span>
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        <span className="text-gray-400">/</span>
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image Skeleton */}
        <div className="aspect-square rounded-lg bg-gray-200 animate-pulse"></div>

        {/* Product Info Skeleton */}
        <div className="flex flex-col space-y-4">
          {/* Title */}
          <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
          
          {/* Category */}
          <div className="h-5 bg-gray-100 rounded animate-pulse w-1/3"></div>

          {/* Price */}
          <div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-16 mb-1"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-40"></div>
          </div>

          {/* Stock Status */}
          <div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-20 mb-1"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>

          {/* Description */}
          <div>
            <div className="h-5 bg-gray-200 rounded animate-pulse w-28 mb-2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-4/6"></div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="mt-auto">
            <div className="h-12 bg-gray-200 rounded-md animate-pulse w-full"></div>
          </div>
        </div>
      </div>

      {/* Back Link Skeleton */}
      <div className="mt-8">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </main>
  );
}
