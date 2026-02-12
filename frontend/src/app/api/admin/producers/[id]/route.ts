import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { getRequestId, logWithId } from '@/lib/observability/request'
import { requireAdmin } from '@/lib/auth/admin'

/**
 * ADMIN-PRODUCERS: PATCH removed — approve/reject go through Laravel SSOT
 * DELETE kept for emergency admin use (Prisma-based, rarely used)
 */

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const rid = getRequestId(_req.headers)

  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
  }

  const params = await ctx.params
  const id = params.id
  await prisma.producer.delete({ where: { id } })
  const res = NextResponse.json({ ok: true })
  res.headers.set('x-request-id', rid)
  logWithId(rid, `DELETE /api/admin/producers/${id} [deleted]`)
  return res
}
