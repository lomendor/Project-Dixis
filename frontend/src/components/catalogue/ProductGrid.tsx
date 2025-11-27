import ProductCard from './ProductCard';

interface ProductGridProps {
  items: any[];
}

export default function ProductGrid({ items }: ProductGridProps) {
  if (items.length === 0) {
    return <p className="mt-4 text-neutral-600">Δεν βρέθηκαν προϊόντα.</p>;
  }
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((p: any) => (
        <ProductCard
          key={p.id}
          id={p.id}
          slug={p.slug}
          name={p.name}
          price={p.price}
          currency={p.currency}
          producer={p.producer}
          imageUrl={p.imageUrl}
        />
      ))}
    </div>
  );
}
