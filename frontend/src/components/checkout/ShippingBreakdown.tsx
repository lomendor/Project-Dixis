'use client';
import React from 'react';
import { fetchQuote, type QuotePayload, type QuoteResponse, type QuoteItem } from '../../lib/quoteClient';

type Props = {
  baseURL?: string;                     // allow override in tests
  onQuote?: (q: QuoteResponse | null) => void;  // callback when quote updates
  initialPostalCode?: string;
  initialMethod?: QuotePayload['method'];
  initialItems?: QuoteItem[];
  initialSubtotal?: number;
};

export default function ShippingBreakdown({
  baseURL,
  onQuote,
  initialPostalCode = '',
  initialMethod = 'COURIER',
  initialItems = [{ weightGrams: 500 }],
  initialSubtotal = 25,
}: Props) {
  const [postalCode, setPostalCode] = React.useState(initialPostalCode);
  const [method, setMethod] = React.useState<QuotePayload['method']>(initialMethod);
  const [weightGrams, setWeightGrams] = React.useState(initialItems[0]?.weightGrams ?? 500);
  const [subtotal, setSubtotal] = React.useState(initialSubtotal);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<QuoteResponse | null>(null);

  const payload = React.useMemo<QuotePayload>(() => ({
    postalCode,
    method,
    items: [{ weightGrams }],
    subtotal,
  }), [postalCode, method, weightGrams, subtotal]);

  async function refresh() {
    setLoading(true); setError(null);
    try {
      const q = await fetchQuote(baseURL, payload);
      setData(q);
      onQuote?.(q);  // AG7b: notify parent of quote update
    } catch (e:any) {
      setError(e?.message ?? 'Quote error');
      setData(null);
      onQuote?.(null);  // AG7b: notify parent of error
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (postalCode.trim().length >= 4) { void refresh(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postalCode, method, weightGrams, subtotal]);

  return (
    <div data-testid="shipping-breakdown" style={{border:'1px solid #e5e7eb', borderRadius:8, padding:16}}>
      <h3 style={{marginTop:0, marginBottom:8}}>Μεταφορικά</h3>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12}}>
        <label>Τ.Κ.
          <input data-testid="postal-input" value={postalCode}
                 onChange={e=>setPostalCode(e.target.value)}
                 placeholder="π.χ. 10431"
                 style={{width:'100%', padding:8, marginTop:4}} />
        </label>
        <label>Μέθοδος
          <select data-testid="method-select" value={method} onChange={e=>setMethod(e.target.value as any)}
                  style={{width:'100%', padding:8, marginTop:4}}>
            <option value="COURIER">Courier</option>
            <option value="COURIER_COD">Courier + Αντικαταβολή</option>
            <option value="PICKUP">Παραλαβή</option>
          </select>
        </label>
        <label>Βάρος (g)
          <input data-testid="weight-input" type="number" min="1" value={weightGrams}
                 onChange={e=>setWeightGrams(parseInt(e.target.value||'0',10))}
                 style={{width:'100%', padding:8, marginTop:4}} />
        </label>
        <label>Subtotal (€)
          <input data-testid="subtotal-input" type="number" step="0.01" min="0" value={subtotal}
                 onChange={e=>setSubtotal(parseFloat(e.target.value||'0'))}
                 style={{width:'100%', padding:8, marginTop:4}} />
        </label>
      </div>

      {/* AG7b: Loading skeleton */}
      {loading && (
        <>
          <div data-testid="skeleton" style={{background:'#f3f4f6',height:56,borderRadius:8,margin:'8px 0'}}></div>
          <div data-testid="loading" style={{color:'#6b7280',fontSize:'0.875rem'}}>Υπολογισμός…</div>
        </>
      )}

      {/* AG7b: Error toast */}
      {error && (
        <div
          data-testid="toast-error"
          style={{background:'#fef2f2',border:'1px solid #dc2626',padding:8,borderRadius:6,margin:'8px 0',color:'#991b1b',fontSize:'0.875rem'}}
        >
          Σφάλμα: {error}
        </div>
      )}

      {data && (
        <div data-testid="quote-results" style={{display:'grid', gap:6}}>
          <div>Ζώνη: <strong>{data.zone}</strong></div>
          <div>Χρέωση κιλών: <strong>{data.chargeableKg.toFixed(2)} kg</strong></div>
          <div>Κόστος μεταφορικών: <strong data-testid="shippingCost">€{data.shippingCost.toFixed(2)}</strong></div>
          {typeof data.codFee === 'number' && <div>Αντικαταβολή: <strong data-testid="codFee">€{data.codFee.toFixed(2)}</strong></div>}
          <div>Δωρεάν μεταφορικά: <strong data-testid="freeShipping">{data.freeShipping ? 'Ναι' : 'Όχι'}</strong></div>

          <details data-testid="why-tooltip">
            <summary>Γιατί;</summary>
            <ul style={{marginTop:8}}>
              {(data.ruleTrace?.slice(0,3) ?? ['—']).map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
