'use server';
import { readCart, writeCart, setQty, remove } from '@/lib/cart/cookie';
import { revalidatePath } from 'next/cache';

export async function setQtyAction(formData:FormData){
  const id = String(formData.get('productId')||'');
  const qty = Math.max(0, Number(formData.get('qty')||0));
  const c = await readCart(); setQty(c, id, qty); await writeCart(c);
  revalidatePath('/cart');
}

export async function removeAction(formData:FormData){
  const id = String(formData.get('productId')||'');
  const c = await readCart(); remove(c, id); await writeCart(c);
  revalidatePath('/cart');
}
