import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSessionPhone } from '@/lib/auth/session';

interface OnboardingRequest {
  displayName: string;
  taxId?: string;
  phone?: string;
  email?: string;
  region?: string;
  category?: string;
  description?: string;
}

/**
 * POST /api/producer/onboarding
 * Creates or updates a producer profile with status=pending
 *
 * Pass PRODUCER-ONBOARDING-FIX-01: Replaced mock with Prisma
 * Pass AUTH-UNIFICATION-01: Links producer to consumer via consumerId
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

    // Pass AUTH-UNIFICATION-01: Get or create consumer for this phone
    let consumer = await prisma.consumer.findUnique({
      where: { phone: sessionPhone },
    });

    if (!consumer) {
      consumer = await prisma.consumer.create({
        data: {
          phone: sessionPhone,
          name: displayName,
          email: body.email?.trim() || null,
        },
      });
    }

    // Check if producer profile already exists
    // Try multiple lookup strategies: direct phone, via consumer
    const existing = await prisma.producer.findFirst({
      where: {
        OR: [
          { phone: sessionPhone },
          { consumerId: consumer.id }
        ]
      },
    });

    let producer;

    if (existing) {
      // Update existing profile
      producer = await prisma.producer.update({
        where: { id: existing.id },
        data: {
          name: displayName,
          email: body.email?.trim() || undefined,
          region: body.region?.trim() || undefined,
          category: body.category?.trim() || undefined,
          description: body.description?.trim() || undefined,
          // Ensure consumer link exists
          consumerId: consumer.id,
          // Don't update status on re-submit - admin controls that
        },
      });
    } else {
      // Create new producer profile linked to consumer
      producer = await prisma.producer.create({
        data: {
          name: displayName,
          slug,
          phone: sessionPhone,
          email: body.email?.trim() || null,
          region: body.region?.trim() || 'Ελλάδα',
          category: body.category?.trim() || 'other',
          description: body.description?.trim() || null,
          approvalStatus: 'pending',
          isActive: false,
          // Pass AUTH-UNIFICATION-01: Link to consumer
          consumerId: consumer.id,
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
        region: producer.region,
        category: producer.category,
        description: producer.description,
        status: producer.approvalStatus === 'approved' && producer.isActive ? 'active' : 'pending',
        approvalStatus: producer.approvalStatus,
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
