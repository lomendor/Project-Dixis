import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index:false, follow:false } };

async function getOrder(token: string) {
  // Use relative URL for same-origin fetch (avoids localhost in production)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const res = await fetch(`${baseUrl}/api/orders/track?token=${encodeURIComponent(token)}`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function TrackPage({ params }: { params: { token: string } }) {
  const data = await getOrder(params.token);
  if (!data) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Παρακολούθηση Παραγγελίας</h1>
      <p className="text-sm text-neutral-700">
        Κωδικός: <strong>{data.id}</strong>
      </p>
      <p className="text-sm mt-1">
        Σύνολο: <strong>{Number(data.total).toFixed(2)} {data.currency}</strong>
      </p>
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
