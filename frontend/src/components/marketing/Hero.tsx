import { Button } from '@/components/ui/button';

export default function Hero(){
  return (
    <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-white to-neutral-50">
      <div className="absolute inset-0 pointer-events-none" aria-hidden />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Τοπικά προϊόντα, απευθείας από παραγωγούς
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          Υποστήριξε Έλληνες παραγωγούς και ανακάλυψε αυθεντικές γεύσεις με διαφάνεια στην παραγγελία και την παράδοση.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/products"><Button>Δες προϊόντα</Button></a>
          <a href="/orders/lookup"><Button variant="outline">Παρακολούθηση παραγγελίας</Button></a>
        </div>
      </div>
    </section>
  );
}
