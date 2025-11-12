export default function LoadingProduct() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <div className="aspect-square w-full rounded-lg bg-neutral-100" />
        <div>
          <div className="h-8 w-2/3 bg-neutral-100 rounded mb-4" />
          <div className="h-6 w-1/3 bg-neutral-100 rounded mb-4" />
          <div className="h-4 w-full bg-neutral-100 rounded mb-2" />
          <div className="h-4 w-5/6 bg-neutral-100 rounded mb-6" />
          <div className="h-10 w-40 bg-neutral-100 rounded" />
        </div>
      </div>
    </div>
  );
}
