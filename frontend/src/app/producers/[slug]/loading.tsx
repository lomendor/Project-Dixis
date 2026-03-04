export default function ProducerDetailLoading() {
  return (
    <main className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Hero / header */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden mb-8 animate-pulse">
        <div className="h-48 bg-neutral-200" />
        <div className="p-6 flex items-start gap-4">
          <div className="w-20 h-20 bg-neutral-200 rounded-full flex-shrink-0 -mt-14 border-4 border-white" />
          <div className="flex-grow space-y-2 pt-1">
            <div className="h-7 bg-neutral-200 rounded w-1/3" />
            <div className="h-4 bg-neutral-100 rounded w-1/4" />
            <div className="h-4 bg-neutral-100 rounded w-full mt-3" />
            <div className="h-4 bg-neutral-100 rounded w-2/3" />
          </div>
        </div>
      </div>
      {/* Products grid */}
      <div className="h-6 bg-neutral-200 rounded w-40 animate-pulse mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-neutral-200" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
              <div className="h-4 bg-neutral-100 rounded w-1/2" />
              <div className="h-8 bg-neutral-200 rounded-lg w-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
