export default function CartLoading() {
  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="h-8 w-32 bg-neutral-200 rounded-md animate-pulse mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 bg-white border border-neutral-200 rounded-xl animate-pulse">
              <div className="w-20 h-20 bg-neutral-200 rounded-lg flex-shrink-0" />
              <div className="flex-grow space-y-2">
                <div className="h-5 bg-neutral-200 rounded w-3/4" />
                <div className="h-4 bg-neutral-100 rounded w-1/3" />
                <div className="h-4 bg-neutral-100 rounded w-1/4" />
              </div>
              <div className="h-6 w-16 bg-neutral-200 rounded flex-shrink-0" />
            </div>
          ))}
        </div>
        {/* Order summary */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 h-fit space-y-4 animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-2/3" />
          <div className="space-y-2">
            <div className="flex justify-between"><div className="h-4 bg-neutral-100 rounded w-1/3" /><div className="h-4 bg-neutral-100 rounded w-1/4" /></div>
            <div className="flex justify-between"><div className="h-4 bg-neutral-100 rounded w-1/3" /><div className="h-4 bg-neutral-100 rounded w-1/4" /></div>
          </div>
          <div className="border-t border-neutral-100 pt-3 flex justify-between"><div className="h-5 bg-neutral-200 rounded w-1/3" /><div className="h-5 bg-neutral-200 rounded w-1/4" /></div>
          <div className="h-11 bg-neutral-200 rounded-lg w-full" />
        </div>
      </div>
    </main>
  );
}
