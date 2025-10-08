import { cookies } from 'next/headers';

export type CartItem = { productId: string; title: string; price: number; qty: number; };
export type Cart = { items: CartItem[] };

const COOKIE = 'dixis_cart';

function read(): Cart {
  const c = cookies().get(COOKIE)?.value;
  try { return c ? JSON.parse(c) as Cart : { items: [] }; } catch { return { items: [] }; }
}

function write(cart: Cart){
  cookies().set(COOKIE, JSON.stringify(cart), {
    path:'/',
    maxAge: 60*60*24*14, // 14 days
    httpOnly: false,
    sameSite:'lax'
  });
}

export function getCart(): Cart {
  return read();
}

export function addItem(it: CartItem){
  const cart = read();
  const ex = cart.items.find(x=> x.productId===it.productId);
  if (ex) {
    ex.qty += it.qty;
  } else {
    cart.items.push({ ...it });
  }
  write(cart);
}

export function setQty(productId: string, qty: number){
  const cart = read();
  const it = cart.items.find(x=> x.productId===productId);
  if (!it) return;
  it.qty = Math.max(0, Math.min(99, Math.floor(qty||0)));
  cart.items = cart.items.filter(x=> x.qty>0);
  write(cart);
}

export function removeItem(productId: string){
  const cart = read();
  cart.items = cart.items.filter(x=> x.productId!==productId);
  write(cart);
}

export function total(cart = read()){ 
  return cart.items.reduce((s,i)=> s + Number(i.price||0)*Number(i.qty||0), 0);
}
