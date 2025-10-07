export type CartItem = {
  productId: string;
  title: string;
  price: number;
  unit?: string;
  stock?: number;
  qty: number;
};

export type Cart = {
  items: CartItem[];
};

const KEY = 'dixis_cart_v1';

export function readCart(): Cart {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(KEY) || '{"items":[]}');
  } catch {
    return { items: [] };
  }
}

export function writeCart(c: Cart) {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(c));
  } catch {}
}

export function addItem(it: CartItem) {
  const c = readCart();
  const idx = c.items.findIndex(x => x.productId === it.productId);
  if (idx >= 0) {
    c.items[idx].qty = Math.min((c.items[idx].qty || 0) + (it.qty || 1), it.stock ?? 999);
  } else {
    c.items.push(it);
  }
  writeCart(c);
  return c;
}

export function setQty(productId: string, qty: number) {
  const c = readCart();
  const i = c.items.find(x => x.productId === productId);
  if (i) {
    i.qty = Math.max(1, Math.min(qty, i.stock ?? 999));
  }
  writeCart(c);
  return c;
}

export function removeItem(productId: string) {
  const c = readCart();
  c.items = c.items.filter(x => x.productId !== productId);
  writeCart(c);
  return c;
}

export function clearCart() {
  writeCart({ items: [] });
}
