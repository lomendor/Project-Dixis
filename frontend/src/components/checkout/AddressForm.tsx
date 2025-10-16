'use client';
import React from 'react';
import { Input } from '../ui/input';

export type Address = {
  fullName?: string;
  street: string;
  city: string;
  region?: string;
  postalCode: string;
  country?: string;
};

type Props = {
  initial?: Partial<Address>;
  onChange?: (addr: Address, valid: boolean) => void;
};

export default function AddressForm({ initial, onChange }: Props) {
  const [addr, setAddr] = React.useState<Address>({
    fullName: initial?.fullName ?? '',
    street: initial?.street ?? '',
    city: initial?.city ?? '',
    region: initial?.region ?? '',
    postalCode: initial?.postalCode ?? '',
    country: initial?.country ?? 'GR',
  });
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const errors = {
    street: !addr.street ? 'Υποχρεωτικό' : '',
    city: !addr.city ? 'Υποχρεωτικό' : '',
    postalCode: !addr.postalCode || addr.postalCode.trim().length < 4 ? 'Ελάχιστο 4 ψηφία' : '',
  };
  const valid = !errors.street && !errors.city && !errors.postalCode;

  React.useEffect(() => {
    onChange?.(addr, valid);
  }, [JSON.stringify(addr), valid]); // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof Address>(k: K, v: Address[K]) {
    setAddr((a) => ({ ...a, [k]: v as any }));
  }

  function Field({
    id,
    label,
    placeholder,
    value,
    onC,
    error,
  }: {
    id: string;
    label: string;
    placeholder?: string;
    value: string;
    onC: (v: string) => void;
    error?: string;
  }) {
    return (
      <div>
        <label htmlFor={id} className="text-sm text-neutral-700">
          {label}
        </label>
        <Input
          id={id}
          value={value}
          onChange={(e) => onC(e.target.value)}
          placeholder={placeholder}
          onBlur={() => setTouched((t) => ({ ...t, [id]: true }))}
        />
        {!!error && touched[id] && (
          <div className="mt-1 text-xs text-red-600">{error}</div>
        )}
      </div>
    );
  }

  return (
    <section
      aria-label="Διεύθυνση παραλαβής"
      className="grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      <Field
        id="fullName"
        label="Ονοματεπώνυμο"
        value={addr.fullName ?? ''}
        onC={(v) => set('fullName', v)}
      />
      <Field
        id="country"
        label="Χώρα"
        value={addr.country ?? 'GR'}
        onC={(v) => set('country', v)}
      />
      <Field
        id="street"
        label="Οδός & αριθμός"
        value={addr.street}
        onC={(v) => set('street', v)}
        error={errors.street}
      />
      <Field
        id="city"
        label="Πόλη"
        value={addr.city}
        onC={(v) => set('city', v)}
        error={errors.city}
      />
      <Field
        id="region"
        label="Περιοχή"
        value={addr.region ?? ''}
        onC={(v) => set('region', v)}
      />
      <Field
        id="postalCode"
        label="Τ.Κ."
        value={addr.postalCode}
        onC={(v) => set('postalCode', v)}
        error={errors.postalCode}
      />
      {!valid && (
        <div className="text-xs text-neutral-600 md:col-span-2">
          Συμπλήρωσε πεδία για να υπολογιστούν σωστά τα μεταφορικά.
        </div>
      )}
    </section>
  );
}
