export default function ProductsLoading() {
  return (
    <main className="container mx-auto px-4 py-6">
      {/* Page Header Skeleton */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-gray-100 rounded-md animate-pulse"></div>
      </div>

      {/* Search/Filter Skeleton */}
      <div className="mb-6 flex gap-3">
        <div className="h-10 flex-1 max-w-md bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden bg-white">
            {/* Image */}
            <div className="aspect-square bg-gray-200 animate-pulse"></div>
            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-9 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
