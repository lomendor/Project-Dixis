import { cookies } from 'next/headers';

export type CartItem = { productId:string; title:string; price:number; unit:string; qty:number; imageUrl?:string|null };
export type Cart = { items: CartItem[] };

const KEY='dixis_cart';

export async function readCart(): Promise<Cart> {
  const c = (await cookies()).get(KEY)?.value;
  if(!c) return { items: [] };
  try { return JSON.parse(c); } catch { return { items: [] }; }
}

export async function writeCart(cart: Cart){
  (await cookies()).set(KEY, JSON.stringify(cart), { httpOnly:false, sameSite:'lax', path:'/' });
}

export function addOrInc(cart:Cart, item:CartItem){
  const i = cart.items.findIndex(x=>x.productId===item.productId);
  if(i>=0){ cart.items[i].qty += item.qty; } else { cart.items.push(item); }
}

export function setQty(cart:Cart, productId:string, qty:number){
  const i = cart.items.findIndex(x=>x.productId===productId);
  if(i>=0){ if(qty<=0) cart.items.splice(i,1); else cart.items[i].qty=qty; }
}

export function remove(cart:Cart, productId:string){
  const i = cart.items.findIndex(x=>x.productId===productId);
  if(i>=0) cart.items.splice(i,1);
}

export function totals(cart:Cart){
  const subtotal = cart.items.reduce((s,i)=> s + i.price*i.qty, 0);
  return { subtotal };
}
