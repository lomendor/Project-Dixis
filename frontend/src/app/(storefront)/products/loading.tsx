export default function Loading() {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 bg-white animate-pulse">
          <div className="aspect-square bg-neutral-200 rounded mb-3" />
          <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2" />
          <div className="h-5 bg-neutral-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}
