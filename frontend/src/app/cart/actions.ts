'use server';
import { prisma } from '@/lib/db/client';
import { readCart, writeCart, addOrInc } from '@/lib/cart/cookie';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function addToCartAction(formData: FormData){
  const productId = String(formData.get('productId')||'');
  const qty = Math.max(1, Number(formData.get('qty')||1));
  const p = await prisma.product.findUnique({ where:{ id: productId }, select:{ id:true, title:true, price:true, unit:true, imageUrl:true, isActive:true, stock:true }});
  if(!p || !p.isActive) return redirect('/products');
  const cart = await readCart();
  addOrInc(cart, { productId: p.id, title: p.title, price: Number(p.price||0), unit: p.unit, qty, imageUrl: p.imageUrl });
  await writeCart(cart);
  revalidatePath('/cart');
  redirect('/cart');
}
