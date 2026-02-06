import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSessionPhone } from '@/lib/auth/session';

interface OnboardingRequest {
  displayName: string;
  taxId?: string;
  phone?: string;
  email?: string;
}

/**
 * POST /api/producer/onboarding
 * Creates or updates a producer profile with status=pending
 *
 * Pass PRODUCER-ONBOARDING-FIX-01: Replaced mock with Prisma
 */
export async function POST(request: NextRequest) {
  try {
    const sessionPhone = await getSessionPhone();

    if (!sessionPhone) {
      return NextResponse.json(
        { error: 'Απαιτείται σύνδεση' },
        { status: 401 }
      );
    }

    const body: OnboardingRequest = await request.json();

    // Validate required fields
    if (!body.displayName?.trim()) {
      return NextResponse.json(
        { error: 'Το όνομα εμφάνισης είναι υποχρεωτικό' },
        { status: 400 }
      );
    }

    const displayName = body.displayName.trim();

    // Generate unique slug from displayName
    // Use Greek-friendly slug: remove special chars, add timestamp for uniqueness
    const baseSlug = displayName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Collapse multiple hyphens
      .slice(0, 40);

    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Check if producer profile exists for this phone
    const existing = await prisma.producer.findFirst({
      where: { phone: sessionPhone },
    });

    let producer;

    if (existing) {
      // Update existing profile
      producer = await prisma.producer.update({
        where: { id: existing.id },
        data: {
          name: displayName,
          email: body.email?.trim() || undefined,
          // Don't update status on re-submit - admin controls that
        },
      });
    } else {
      // Create new producer profile
      producer = await prisma.producer.create({
        data: {
          name: displayName,
          slug,
          phone: sessionPhone,
          email: body.email?.trim() || null,
          region: 'Ελλάδα', // Default region
          category: 'other', // Default category
          approvalStatus: 'pending',
          isActive: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Η αίτηση υποβλήθηκε επιτυχώς',
      profile: {
        id: producer.id,
        name: producer.name,
        phone: producer.phone,
        email: producer.email,
        status: producer.approvalStatus === 'approved' && producer.isActive ? 'active' : 'pending',
        created_at: producer.createdAt.toISOString(),
        updated_at: producer.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('[Producer Onboarding] Error:', error);
    return NextResponse.json(
      { error: 'Παρουσιάστηκε σφάλμα κατά την υποβολή' },
      { status: 500 }
    );
  }
}
