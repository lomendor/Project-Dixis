import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy';
import { getLaravelInternalUrl } from '@/env';
import { logAdminAction } from '@/lib/audit/logger';
import { deleteObject } from '@/lib/media/storage';

/**
 * ADMIN-LATLNG-01: Update producer profile fields — proxy to Laravel SSOT
 * ADMIN-PRODUCER-DELETE-01: GET preview + DELETE with audit log + S3 cleanup
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (error) {
    return handleAdminError(error);
  }

  const { id: producerId } = await params;

  if (!producerId) {
    return NextResponse.json({ error: 'Invalid producer ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const token = await getAdminToken();
    const laravelBase = getLaravelInternalUrl();
    const url = `${laravelBase}/admin/producers/${producerId}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Σφάλμα ενημέρωσης παραγωγού' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      message: data.message || 'Ενημερώθηκε',
      producer: data.producer,
    });
  } catch (error) {
    console.error('[Admin] Producer update proxy error:', error);
    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 });
  }
}

/**
 * GET deletion-preview — proxies to Laravel so the UI can render the
 * right warning text BEFORE the admin types ΔΙΑΓΡΑΦΗ.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (error) {
    return handleAdminError(error);
  }

  const { id: producerId } = await params;
  if (!producerId) {
    return NextResponse.json({ error: 'Invalid producer ID' }, { status: 400 });
  }

  try {
    const token = await getAdminToken();
    const url = `${getLaravelInternalUrl()}/admin/producers/${producerId}/deletion-preview`;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { method: 'GET', headers, cache: 'no-store' });
    const body = await res.json().catch(() => ({}));
    return NextResponse.json(body, { status: res.status });
  } catch (error) {
    console.error('[Admin] Producer preview proxy error:', error);
    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 });
  }
}

/**
 * DELETE producer — proxies to Laravel, then:
 *   1. writes AdminAuditLog row (PRODUCER_DELETE_HARD or _SOFT)
 *   2. cleans S3 doc URLs returned by Laravel (best-effort)
 * Both post-delete steps are non-blocking: failures are logged but the
 * admin still sees a success toast, because the DB mutation already
 * succeeded in Laravel inside a transaction.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    return handleAdminError(error);
  }

  const { id: producerId } = await params;
  if (!producerId) {
    return NextResponse.json({ error: 'Invalid producer ID' }, { status: 400 });
  }

  const reqBody = await request.json().catch(() => ({}) as { reason?: string });
  const reason =
    typeof reqBody?.reason === 'string' ? reqBody.reason : undefined;

  try {
    const token = await getAdminToken();
    const url = `${getLaravelInternalUrl()}/admin/producers/${producerId}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers,
      body: JSON.stringify(reason ? { reason } : {}),
      cache: 'no-store',
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: body.message || 'Σφάλμα διαγραφής παραγωγού' },
        { status: res.status }
      );
    }

    // Audit log — PII-safe snapshot from Laravel + admin-supplied reason
    try {
      await logAdminAction({
        admin,
        action:
          body.mode === 'hard'
            ? 'PRODUCER_DELETE_HARD'
            : 'PRODUCER_DELETE_SOFT',
        entityType: 'producer',
        entityId: String(body.producer_id ?? producerId),
        oldValue: body.snapshot ?? undefined,
        newValue: body.mode === 'hard' ? undefined : { anonymized: true },
        details: reason,
      });
    } catch (auditErr) {
      console.error('[Admin] Producer delete audit write failed', auditErr);
    }

    // S3 cleanup — best-effort, never blocks the response
    const docUrls: string[] = Array.isArray(body.doc_urls_to_clean)
      ? body.doc_urls_to_clean
      : [];
    const cleanup = await Promise.allSettled(docUrls.map(u => deleteObject(u)));
    const docCleanupFailures = cleanup.filter(
      r =>
        r.status === 'rejected' ||
        (r.status === 'fulfilled' && r.value === false)
    ).length;

    return NextResponse.json({
      success: true,
      mode: body.mode,
      references: body.references,
      user_anonymized: body.user_anonymized,
      stripe_disconnect_ok: body.stripe_disconnect_ok,
      doc_cleanup: { total: docUrls.length, failures: docCleanupFailures },
      message: body.message || 'Διαγράφηκε',
    });
  } catch (error) {
    console.error('[Admin] Producer delete proxy error:', error);
    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 });
  }
}
