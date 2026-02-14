'use client';
import React from 'react';
import { fetchQuote, type QuotePayload, type QuoteResponse, type QuoteItem } from '../../lib/quoteClient';
import { Card, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { Tooltip } from '../ui/tooltip';
import { useToast } from '@/contexts/ToastContext';
import { formatEUR } from '../../lib/money';
import { debounce } from '../../lib/debounce';

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

  const { showToast } = useToast();

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
      const errorMsg = e?.message ?? 'Quote error';
      setError(errorMsg);
      setData(null);
      showToast('error', `Σφάλμα: ${errorMsg}`);  // AG8: use global toast
      onQuote?.(null);  // AG7b: notify parent of error
    } finally {
      setLoading(false);
    }
  }

  // AG9: Debounced refresh (300ms delay)
  const debouncedRefresh = React.useMemo(
    () => debounce(refresh, 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [postalCode, method, weightGrams, subtotal]
  );

  React.useEffect(() => {
    if (postalCode.trim().length >= 4) { void debouncedRefresh(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postalCode, method, weightGrams, subtotal]);

  return (
    <Card data-testid="shipping-breakdown">
      <CardTitle className="mb-2">Μεταφορικά</CardTitle>

      {/* AG9: a11y labels with htmlFor/id + consistent spacing */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <label htmlFor="postal-input" className="block">
          <span className="text-sm font-medium text-neutral-700">Τ.Κ.</span>
          <Input
            id="postal-input"
            data-testid="postal-input"
            value={postalCode}
            onChange={e => setPostalCode(e.target.value)}
            placeholder="π.χ. 10431"
            className="mt-1.5"
          />
        </label>
        <label htmlFor="method-select" className="block">
          <span className="text-sm font-medium text-neutral-700">Μέθοδος</span>
          <Select
            id="method-select"
            data-testid="method-select"
            value={method}
            onChange={e => setMethod(e.target.value as any)}
            className="mt-1.5"
          >
            <option value="COURIER">Courier</option>
            <option value="COURIER_COD">Courier + Αντικαταβολή</option>
            <option value="PICKUP">Παραλαβή</option>
          </Select>
        </label>
        <label htmlFor="weight-input" className="block">
          <span className="text-sm font-medium text-neutral-700">Βάρος (g)</span>
          <Input
            id="weight-input"
            data-testid="weight-input"
            type="number"
            min="1"
            value={weightGrams}
            onChange={e => setWeightGrams(parseInt(e.target.value||'0',10))}
            className="mt-1.5"
          />
        </label>
        <label htmlFor="subtotal-input" className="block">
          <span className="text-sm font-medium text-neutral-700">Subtotal (€)</span>
          <Input
            id="subtotal-input"
            data-testid="subtotal-input"
            type="number"
            step="0.01"
            min="0"
            value={subtotal}
            onChange={e => setSubtotal(parseFloat(e.target.value||'0'))}
            className="mt-1.5"
          />
        </label>
      </div>

      {/* AG9: Empty/invalid state hint */}
      {postalCode.trim().length < 4 && !loading && !data && (
        <div data-testid="empty-hint" className="text-sm text-neutral-500 mb-3">
          Εισάγετε Τ.Κ. (τουλάχιστον 4 ψηφία) για υπολογισμό μεταφορικών.
        </div>
      )}

      {/* AG8: Use Skeleton component */}
      {loading && (
        <>
          <Skeleton data-testid="skeleton" className="h-14 w-full my-2" />
          <div data-testid="loading" className="text-neutral-500 text-sm">Υπολογισμός…</div>
        </>
      )}

      {/* Keep toast-error testid for backward compatibility but hide it (toast shows instead) */}
      {error && <div data-testid="toast-error" className="hidden">{error}</div>}

      {data && (
        <div data-testid="quote-results" className="grid gap-2 text-sm">
          <div>Ζώνη: <strong>{data.zone}</strong></div>
          <div>Χρέωση κιλών: <strong>{data.chargeableKg.toFixed(2)} kg</strong></div>
          {/* AG9: Use formatEUR for money display */}
          <div>Κόστος μεταφορικών: <strong data-testid="shippingCost">{formatEUR(data.shippingCost)}</strong></div>
          {typeof data.codFee === 'number' && <div>Αντικαταβολή: <strong data-testid="codFee">{formatEUR(data.codFee)}</strong></div>}
          <div>Δωρεάν μεταφορικά: <strong data-testid="freeShipping">{data.freeShipping ? 'Ναι' : 'Όχι'}</strong></div>

          {/* AG8: Use Tooltip component */}
          <div data-testid="why-tooltip">
            <Tooltip>
              <ul className="mt-1 list-disc pl-5">
                {(data.ruleTrace?.slice(0,3) ?? ['—']).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </Tooltip>
          </div>
        </div>
      )}
    </Card>
  );
}
