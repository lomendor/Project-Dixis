import { cookies } from 'next/headers';

export type CartItem = { productId: string; title: string; price: number; qty: number; };
export type Cart = { items: CartItem[] };

const COOKIE = 'dixis_cart';

async function read(): Promise<Cart> {
  const c = (await cookies()).get(COOKIE)?.value;
  try { return c ? JSON.parse(c) as Cart : { items: [] }; } catch { return { items: [] }; }
}

async function write(cart: Cart){
  (await cookies()).set(COOKIE, JSON.stringify(cart), {
    path:'/',
    maxAge: 60*60*24*14, // 14 days
    httpOnly: false,
    sameSite:'lax'
  });
}

export async function getCart(): Promise<Cart> {
  return read();
}

export async function addItem(it: CartItem){
  const cart = await read();
  const ex = cart.items.find(x=> x.productId===it.productId);
  if (ex) {
    ex.qty += it.qty;
  } else {
    cart.items.push({ ...it });
  }
  await write(cart);
}

export async function setQty(productId: string, qty: number){
  const cart = await read();
  const it = cart.items.find(x=> x.productId===productId);
  if (!it) return;
  it.qty = Math.max(0, Math.min(99, Math.floor(qty||0)));
  cart.items = cart.items.filter(x=> x.qty>0);
  await write(cart);
}

export async function removeItem(productId: string){
  const cart = await read();
  cart.items = cart.items.filter(x=> x.productId!==productId);
  await write(cart);
}

export async function total(cart?: Cart): Promise<number> {
  const c = cart || await read();
  return c.items.reduce((s,i)=> s + Number(i.price||0)*Number(i.qty||0), 0);
}
