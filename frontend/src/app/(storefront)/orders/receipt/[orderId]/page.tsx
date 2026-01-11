import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getOrder(orderId: string) {
  // Use relative URL for same-origin fetch (no localhost in production)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/orders/lookup`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, email: '' }),
      cache: 'no-store',
    }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function ReceiptPage({
  params,
}: {
  params: { orderId: string };
}) {
  const data = await getOrder(params.orderId);
  if (!data) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Απόδειξη Παραγγελίας</h1>
      <p className="text-sm text-neutral-700">
        Κωδικός: <strong>{data.id}</strong>
      </p>
      <p className="text-sm mt-1">
        Σύνολο:{' '}
        <strong>
          {Number(data.total).toFixed(2)} {data.currency}
        </strong>
      </p>
      {data.shipping !== undefined && (
        <p className="text-sm mt-1">
          Μεταφορικά: {Number(data.shipping).toFixed(2)} {data.currency}
        </p>
      )}
      <h2 className="mt-4 font-semibold">Είδη</h2>
      <ul className="list-disc ml-5 text-sm">
        {data.items?.map((it: any) => (
          <li key={it.id}>
            {it.slug} × {it.qty} — {Number(it.price).toFixed(2)} {it.currency}
          </li>
        ))}
      </ul>
    </main>
  );
}
