export default function OrdersLoading() {
  return (
    <main className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="h-8 w-48 bg-neutral-200 rounded-md animate-pulse mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-xl p-4 animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-1.5">
                <div className="h-5 bg-neutral-200 rounded w-32" />
                <div className="h-3 bg-neutral-100 rounded w-24" />
              </div>
              <div className="h-6 bg-neutral-100 rounded-full w-20" />
            </div>
            <div className="flex gap-3">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="w-12 h-12 bg-neutral-100 rounded-lg flex-shrink-0" />
              ))}
              <div className="flex-grow space-y-1.5">
                <div className="h-4 bg-neutral-100 rounded w-2/3" />
                <div className="h-3 bg-neutral-100 rounded w-1/3" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between">
              <div className="h-4 bg-neutral-100 rounded w-1/4" />
              <div className="h-4 bg-neutral-200 rounded w-1/5" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
