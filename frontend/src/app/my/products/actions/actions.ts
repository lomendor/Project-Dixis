'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { ProductFormSchema } from '@/lib/validations/product';

export async function createProduct(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = ProductFormSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  try {
    await prisma.product.create({
      data: {
        title: data.title,
        category: data.category,
        price: data.price,
        unit: data.unit,
        stock: data.stock,
        description: data.description,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        producerId: data.producerId,
      },
    });

    revalidatePath('/my/products');
    return { ok: true };
  } catch (error) {
    console.error('Create product error:', error);
    return { ok: false, errors: { _form: ['Σφάλμα δημιουργίας προϊόντος'] } };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = ProductFormSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        category: data.category,
        price: data.price,
        unit: data.unit,
        stock: data.stock,
        description: data.description,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
      },
    });

    revalidatePath('/my/products');
    return { ok: true };
  } catch (error) {
    console.error('Update product error:', error);
    return { ok: false, errors: { _form: ['Σφάλμα ενημέρωσης προϊόντος'] } };
  }
}

export async function toggleActive(id: string, active: boolean) {
  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: active },
    });

    revalidatePath('/my/products');
    return { ok: true };
  } catch (error) {
    console.error('Toggle active error:', error);
    return { ok: false, error: 'Σφάλμα αλλαγής κατάστασης' };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath('/my/products');
    redirect('/my/products');
  } catch (error) {
    console.error('Delete product error:', error);
    return { ok: false, error: 'Σφάλμα διαγραφής προϊόντος' };
  }
}
