import { notFound } from 'next/navigation';

export default async function SuccessPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const params = await searchParams;
  const orderId = params?.order;
  if (!orderId) return notFound();
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Η παραγγελία καταχωρήθηκε</h1>
      <p className="text-sm text-neutral-700">Κωδικός παραγγελίας: <strong data-testid="order-id">{orderId}</strong></p>
      <p className="mt-4">Θα επικοινωνήσουμε μαζί σας για την επιβεβαίωση.</p>
    </main>
  );
}
