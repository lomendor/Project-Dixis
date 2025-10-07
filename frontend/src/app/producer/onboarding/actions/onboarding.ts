'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { getSessionPhone } from '@/lib/auth/session';
import { z } from 'zod';

const onboardingSchema = z.object({
  name: z.string().min(2, 'Παρακαλώ δώστε επωνυμία (τουλάχιστον 2 χαρακτήρες)'),
  region: z.string().min(2, 'Παρακαλώ δώστε περιοχή (τουλάχιστον 2 χαρακτήρες)'),
  category: z.string().min(2, 'Παρακαλώ επιλέξτε κατηγορία'),
  description: z.string().max(2000, 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 2000 χαρακτήρες').optional(),
  contactPhone: z.string().optional()
});

export async function completeOnboardingAction(formData: FormData) {
  // Get phone from session
  const phone = await getSessionPhone();
  
  if (!phone) {
    throw new Error('Απαιτείται είσοδος');
  }

  // Check if producer already exists
  const existingProducer = await prisma.producer.findFirst({
    where: { phone, isActive: true }
  });

  if (existingProducer) {
    // Already onboarded, redirect to products
    return redirect('/my/products');
  }

  // Parse and validate form data
  const rawData = {
    name: formData.get('name'),
    region: formData.get('region'),
    category: formData.get('category'),
    description: formData.get('description') || '',
    contactPhone: formData.get('contactPhone') || phone
  };

  const validation = onboardingSchema.safeParse(rawData);
  
  if (!validation.success) {
    const firstError = validation.error.errors[0];
    throw new Error(firstError.message);
  }

  const data = validation.data;

  // Generate slug from name
  const slug = data.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Create producer (idempotent using upsert with phone as unique identifier)
  await prisma.producer.upsert({
    where: { slug },
    update: {
      name: data.name,
      region: data.region,
      category: data.category,
      description: data.description || null,
      phone: data.contactPhone || phone,
      isActive: true
    },
    create: {
      slug,
      name: data.name,
      region: data.region,
      category: data.category,
      description: data.description || null,
      phone: data.contactPhone || phone,
      isActive: true
    }
  });

  // Redirect to products page after successful onboarding
  redirect('/my/products');
}
