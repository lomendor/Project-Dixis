export default function ProducersLoading() {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="h-8 w-40 bg-neutral-200 rounded-md animate-pulse mb-2" />
      <div className="h-4 w-72 bg-neutral-100 rounded-md animate-pulse mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-xl overflow-hidden animate-pulse">
            <div className="h-40 bg-neutral-200" />
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-200 rounded-full flex-shrink-0" />
                <div className="flex-grow space-y-1.5">
                  <div className="h-5 bg-neutral-200 rounded w-2/3" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-4 bg-neutral-100 rounded w-full" />
              <div className="h-4 bg-neutral-100 rounded w-3/4" />
              <div className="flex gap-2">
                <div className="h-6 bg-neutral-100 rounded-full w-16" />
                <div className="h-6 bg-neutral-100 rounded-full w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
