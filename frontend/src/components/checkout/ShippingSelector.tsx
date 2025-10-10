'use client';
import { useEffect, useState } from 'react';

type Method = 'PICKUP' | 'COURIER' | 'COURIER_COD';

export default function ShippingSelector({ onChange }: { onChange?: (m: Method) => void }) {
  const [method, setMethod] = useState<Method>('COURIER');

  useEffect(() => {
    onChange?.(method);
  }, [method, onChange]);

  const options: { code: Method; label: string }[] = [
    { code: 'PICKUP', label: 'Παραλαβή από κατάστημα' },
    { code: 'COURIER', label: 'Κούριερ' },
    { code: 'COURIER_COD', label: 'Κούριερ (αντικαταβολή)' },
  ];

  return (
    <fieldset style={{ marginTop: 16 }}>
      <legend style={{ fontWeight: 600, marginBottom: 8 }}>Μέθοδος αποστολής</legend>
      {options.map(opt => (
        <label key={opt.code} style={{ display: 'block', marginBottom: 6 }}>
          <input
            type="radio"
            name="shipping_method"
            value={opt.code}
            checked={method === opt.code}
            onChange={() => setMethod(opt.code)}
          />
          <span style={{ marginLeft: 8 }}>{opt.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
