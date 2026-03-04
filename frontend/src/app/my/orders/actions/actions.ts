'use server';

/**
 * DEPRECATED — ARCH-FIX-01
 *
 * This server action used the old requireProducer() + Prisma orderItem pattern.
 * Orders now live exclusively in Laravel/PostgreSQL — Prisma has no access to them.
 * Producer order management goes through /producer/orders → Laravel API.
 *
 * This file is kept as a stub to avoid breaking any remaining imports.
 * Safe to delete once confirmed no page references it.
 */

export async function setOrderItemStatus(
  _id: string,
  _next: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'FULFILLED'
) {
  return {
    ok: false,
    error: 'Deprecated: Order management has moved to the producer dashboard. Use /producer/orders instead.',
  };
}
