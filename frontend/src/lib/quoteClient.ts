export type QuoteItem = {
  weightGrams: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
};

export type QuotePayload = {
  postalCode: string;
  method: 'COURIER' | 'COURIER_COD' | 'PICKUP';
  items: QuoteItem[];
  subtotal: number;
};

export type QuoteResponse = {
  shippingCost: number;
  codFee?: number;
  freeShipping?: boolean;
  chargeableKg: number;
  zone: string;
  ruleTrace?: string[];
};

export async function fetchQuote(baseURL: string | undefined, payload: QuotePayload): Promise<QuoteResponse> {
  const url = `${baseURL ?? ''}/api/checkout/quote`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Quote failed (${res.status}): ${text}`);
  }
  return res.json();
}
