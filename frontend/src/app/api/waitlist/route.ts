import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { z } from 'zod';

/**
 * Waitlist API Route (AG116.1)
 *
 * Accepts interest from users (buyers/producers) during landing mode.
 * Stores submissions in Waitlist table for follow-up.
 */

const waitlistSchema = z.object({
  name: z.string().min(2, 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες'),
  email: z.string().email('Μη έγκυρη διεύθυνση email'),
  role: z.enum(['buyer', 'producer'], {
    errorMap: () => ({ message: 'Επιλέξτε αγοραστής ή παραγωγός' }),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = waitlistSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Μη έγκυρα δεδομένα',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, role } = validationResult.data;

    // Check for duplicate email (optional: prevent spam)
    const existing = await prisma.waitlist.findFirst({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: 'Το email έχει ήδη καταχωρηθεί',
          duplicate: true,
        },
        { status: 200 } // Return 200 to avoid leaking user existence
      );
    }

    // Create waitlist entry
    const entry = await prisma.waitlist.create({
      data: {
        name,
        email,
        role,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Ευχαριστούμε για το ενδιαφέρον σας!',
        id: entry.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Waitlist API error:', error);

    // Handle Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === 'P2002') {
        // Unique constraint violation
        return NextResponse.json(
          {
            error: 'Το email έχει ήδη καταχωρηθεί',
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Παρουσιάστηκε σφάλμα κατά την καταχώρηση',
      },
      { status: 500 }
    );
  }
}

// Return 405 for non-POST methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
