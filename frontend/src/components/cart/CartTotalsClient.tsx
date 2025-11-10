'use client';
import { useEffect, useMemo, useState } from 'react';

type Item = { slug: string; qty: number; price?: number };
type Zone = 'mainland' | 'islands';
const EUR = (n:number) => n.toFixed(2);

export default function CartTotalsClient({
  items, subtotal, currency='EUR', initialZone='mainland', threshold=35
}: { items: Item[]; subtotal: number; currency?: string; initialZone?: Zone; threshold?: number }) {
  const [zone, setZone] = useState<Zone>(initialZone);
  const [shipping, setShipping] = useState<number>(0);
  const [busy, setBusy] = useState(false);

  const remaining = useMemo(() => Math.max(0, threshold - Number(subtotal||0)), [threshold, subtotal]);
  const grandTotal = useMemo(() => Math.max(0, Number(subtotal||0) + Number(shipping||0)), [subtotal, shipping]);

  async function recalc(z: Zone = zone) {
    try {
      setBusy(true);
      const r = await fetch('/api/v1/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(i => ({ slug: i.slug, qty: i.qty })), zone: z })
      });
      const data = await r.json().catch(() => ({}));
      if (typeof data?.total === 'number') setShipping(data.total);
      else setShipping(0);
    } catch { setShipping(0); }
    finally { setBusy(false); }
  }

  useEffect(() => { recalc(zone); /* eslint-disable-next-line */ }, [zone, items.length, subtotal]);

  return (
    <section className="p-4 border rounded">
      <div className="mb-3">
        <label htmlFor="zone" className="text-sm block mb-1">Ζώνη αποστολής</label>
        <select id="zone" data-testid="zone-select" className="border rounded px-2 py-1"
                value={zone} onChange={e => setZone((e.target.value as Zone) || 'mainland')} aria-busy={busy}>
          <option value="mainland">Ηπειρωτική Ελλάδα</option>
          <option value="islands">Νησιά</option>
        </select>
      </div>

      <div className="mb-3 text-sm">
        <strong>Δωρεάν μεταφορικά</strong> για παραγγελίες άνω των {EUR(threshold)} {currency}.
        {remaining > 0 ? (
          <div data-testid="remaining-to-free" className="text-neutral-600">
            Σου λείπουν {EUR(remaining)} {currency} για δωρεάν μεταφορικά.
          </div>
        ) : (
          <div className="text-green-700" data-testid="free-shipping-active">Τα μεταφορικά είναι δωρεάν! 🎉</div>
        )}
      </div>

      <dl className="text-sm space-y-1">
        <div className="flex justify-between"><dt>Υποσύνολο</dt><dd>{EUR(Number(subtotal||0))} {currency}</dd></div>
        <div className="flex justify-between"><dt>Μεταφορικά</dt>
          <dd data-testid="shipping-amount">{EUR(Number(shipping||0))} {currency}</dd></div>
        <div className="flex justify-between font-semibold border-t pt-2 mt-2">
          <dt>Σύνολο</dt><dd data-testid="cart-grand-total">{EUR(grandTotal)} {currency}</dd></div>
      </dl>
    </section>
  );
}
