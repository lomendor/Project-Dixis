export type ItemQty = { product_id: number | string; qty: number };
export type ItemQuantity = { product_id: number | string; quantity: number };
export type ItemAny = ItemQty | ItemQuantity;

export function toQty(items: ItemAny[]): ItemQty[] {
  return (items||[]).map((i:any) => 'qty' in i
    ? { product_id: Number(i.product_id), qty: Number(i.qty) }
    : { product_id: Number(i.product_id), qty: Number(i.quantity) });
}
