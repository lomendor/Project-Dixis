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
  currency = "EUR",
  producer
}: ProductCardProps) {
  const currencySymbol = currency === 'EUR' ? '€' : currency;
  const numericPrice = Number(price ?? 0);

  return (
    <article className="border rounded-md p-3 hover:shadow-md transition-shadow">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm mt-1 text-green-700 font-medium">
        {numericPrice.toFixed(2)} {currencySymbol}
      </p>
      {producer?.name && (
        <p className="text-xs text-neutral-600 mt-1">{producer.name}</p>
      )}
    </article>
  );
}
