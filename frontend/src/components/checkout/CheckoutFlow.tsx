'use client';
import React from 'react';
import AddressForm, { type Address } from './AddressForm';
import ShippingBreakdown from './ShippingBreakdown';
import { Select } from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardTitle } from '../ui/card';
import { formatEUR } from '../../lib/money';

type Quote = { shippingCost: number; codFee?: number; freeShipping?: boolean };

export default function CheckoutFlow() {
  const [address, setAddress] = React.useState<Address>({
    street: '',
    city: '',
    postalCode: '',
    country: 'GR',
  });
  const [addrValid, setAddrValid] = React.useState(false);
  const [method, setMethod] = React.useState<
    'COURIER' | 'COURIER_COD' | 'PICKUP'
  >('COURIER');
  const [weight, setWeight] = React.useState(500);
  const [subtotal, setSubtotal] = React.useState(25);
  const [quote, setQuote] = React.useState<Quote | null>(null);

  const total = React.useMemo(() => {
    const ship = quote?.shippingCost ?? 0;
    const cod = quote?.codFee ?? 0;
    return +(subtotal + ship + cod).toFixed(2);
  }, [subtotal, quote]);

  function onAddrChange(a: Address, valid: boolean) {
    setAddress(a);
    setAddrValid(valid);
  }

  function onQuote(q: any) {
    setQuote(q);
  }

  function proceed() {
    const summary = { address, method, weight, subtotal, quote, total };
    try {
      localStorage.setItem('checkout_last_summary', JSON.stringify(summary));
    } catch {}
    window.location.href = '/checkout/payment';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">
        <Card>
          <CardTitle>Διεύθυνση</CardTitle>
          <div className="mt-3">
            <AddressForm initial={address} onChange={onAddrChange} />
          </div>
        </Card>

        <Card>
          <CardTitle>Ρυθμίσεις αποστολής</CardTitle>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-neutral-700">Μέθοδος</label>
              <Select
                data-testid="flow-method"
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
              >
                <option value="COURIER">Courier</option>
                <option value="COURIER_COD">Courier + Αντικαταβολή</option>
                <option value="PICKUP">Παραλαβή</option>
              </Select>
            </div>
            <div>
              <label className="text-sm text-neutral-700">Βάρος (g)</label>
              <Input
                data-testid="flow-weight"
                type="number"
                min={1}
                value={weight}
                onChange={(e) =>
                  setWeight(parseInt(e.target.value || '0', 10))
                }
              />
            </div>
            <div>
              <label className="text-sm text-neutral-700">Subtotal (€)</label>
              <Input
                data-testid="flow-subtotal"
                type="number"
                min={0}
                step="0.01"
                value={subtotal}
                onChange={(e) =>
                  setSubtotal(parseFloat(e.target.value || '0'))
                }
              />
            </div>
          </div>
          <div className="mt-3">
            <ShippingBreakdown
              initialPostalCode={address.postalCode}
              initialMethod={method}
              initialItems={[{ weightGrams: weight }]}
              initialSubtotal={subtotal}
              onQuote={onQuote}
            />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardTitle>Σύνοψη</CardTitle>
          <div className="mt-3 space-y-2 text-sm">
            <div>
              Subtotal: <strong>{formatEUR(subtotal)}</strong>
            </div>
            <div>
              Μεταφορικά:{' '}
              <strong>{formatEUR(quote?.shippingCost ?? 0)}</strong>
            </div>
            {typeof quote?.codFee === 'number' && (
              <div>
                Αντικαταβολή:{' '}
                <strong>{formatEUR(quote?.codFee ?? 0)}</strong>
              </div>
            )}
            <div>
              Σύνολο:{' '}
              <strong data-testid="flow-order-total">{formatEUR(total)}</strong>
            </div>
            {quote?.freeShipping && (
              <div className="text-emerald-700">Δωρεάν μεταφορικά</div>
            )}
          </div>
          <div className="mt-3">
            <Button
              data-testid="flow-proceed"
              onClick={proceed}
              disabled={!addrValid}
            >
              Συνέχεια στην πληρωμή
            </Button>
            {!addrValid && (
              <div className="mt-2 text-xs text-neutral-600">
                Συμπλήρωσε τα στοιχεία διεύθυνσης.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
