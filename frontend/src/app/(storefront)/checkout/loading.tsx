export default function CheckoutLoading() {
  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="h-8 w-48 bg-neutral-200 rounded-md animate-pulse mb-6" />
      {/* Progress steps */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-200 rounded-full animate-pulse" />
            <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6 space-y-5 animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 bg-neutral-100 rounded w-1/4" />
              <div className="h-10 bg-neutral-100 rounded-lg w-full" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><div className="h-4 bg-neutral-100 rounded w-1/3" /><div className="h-10 bg-neutral-100 rounded-lg" /></div>
            <div className="space-y-1.5"><div className="h-4 bg-neutral-100 rounded w-1/3" /><div className="h-10 bg-neutral-100 rounded-lg" /></div>
          </div>
        </div>
        {/* Summary */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 h-fit space-y-4 animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-2/3" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-2">
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex-shrink-0" />
              <div className="flex-grow space-y-1.5"><div className="h-4 bg-neutral-100 rounded w-3/4" /><div className="h-3 bg-neutral-100 rounded w-1/2" /></div>
            </div>
          ))}
          <div className="border-t border-neutral-100 pt-3 space-y-2">
            <div className="flex justify-between"><div className="h-4 bg-neutral-100 rounded w-1/3" /><div className="h-4 bg-neutral-100 rounded w-1/4" /></div>
            <div className="flex justify-between"><div className="h-5 bg-neutral-200 rounded w-1/3" /><div className="h-5 bg-neutral-200 rounded w-1/4" /></div>
          </div>
        </div>
      </div>
    </main>
  );
}
