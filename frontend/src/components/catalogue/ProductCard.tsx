export type ProductCardProps = {
  id: string;
  title: string;
  price: number;
  currency?: string;
  producer?: { id: string; name: string } | null;
};

export default function ProductCard({ 
  title, 
  price, 
  currency = "€", 
  producer 
}: ProductCardProps) {
  return (
    <article className="border rounded-md p-3 hover:shadow-md transition-shadow">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm mt-1 text-green-700 font-medium">
        {Number(price).toFixed(2)} {currency}
      </p>
      {producer?.name && (
        <p className="text-xs text-neutral-600 mt-1">{producer.name}</p>
      )}
    </article>
  );
}
