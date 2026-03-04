export default function FavoritesLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="h-8 w-56 bg-neutral-200 rounded-md animate-pulse" />
          <div className="h-4 w-40 bg-neutral-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-neutral-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-neutral-100 rounded w-1/3" />
                <div className="h-5 bg-neutral-200 rounded w-full" />
                <div className="h-5 bg-neutral-100 rounded w-1/4 mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
