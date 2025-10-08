/** Canonical cart items after normalization */
export type Item = { product_id: number; qty: number };

/** Επιτρεπτά inputs πριν το normalize */
export type ItemInput =
  | { product_id: number | string; qty: number }
  | { product_id: number | string; quantity: number };

export function normalizeItems(items: ItemInput[] = []): Item[] {
  return items.map((i: any) => ({
    product_id: Number(i.product_id),
    qty: Number('qty' in i ? i.qty : i.quantity),
  }));
}

// Συμβατότητα με παλιά ονόματα
export const toQty = normalizeItems;
