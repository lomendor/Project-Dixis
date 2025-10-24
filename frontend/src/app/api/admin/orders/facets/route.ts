import { NextRequest, NextResponse } from 'next/server';
import { performance } from 'node:perf_hooks';
import { getOrdersRepo } from '@/lib/orders/providers';
import type { ListParams } from '@/lib/orders/providers';
import { createPgFacetProvider, type FacetQuery } from '../../../../admin/orders/_server/facets.provider';
import { prisma } from '@/server/db/prisma';
import { get as getCache, set as setCache, makeKey, DEFAULT_TTL_MS } from '../../../../server/cache/facets.cache';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const forceDemo = url.searchParams.get('demo') === '1';

  // AG97.2 — Env-guarded PG provider wiring (demo-safe)
  const isDemo = forceDemo || url.searchParams.get('mode') === 'demo';
  const wantPg = process.env.DIXIS_AGG_PROVIDER === 'pg';

  // Μόνο όταν ΘΕΛΟΥΜΕ PG και ΔΕΝ είμαστε σε demo path, δοκίμασε PG aggregation.
  if (wantPg && !isDemo) {
    try {
      // AG104 — Use shared Prisma client singleton
      const provider = createPgFacetProvider(() => prisma);

      const q: FacetQuery = {
        status: url.searchParams.get('status') || undefined,
        q: url.searchParams.get('q') || undefined,
        fromDate: url.searchParams.get('fromDate') || undefined,
        toDate: url.searchParams.get('toDate') || undefined,
        sort: url.searchParams.get('sort') || undefined,
      };

      // AG105 — Performance timing (env-guarded)
      const t0 = performance.now();
      let totals: Record<string, number>; let total: number; let cacheHdr = '';
      // AG106 — In-memory cache (env-guarded)
      if (process.env.DIXIS_CACHE === '1') {
        const key = makeKey(q);
        const hit = getCache(key);
        if (hit) {
          totals = hit.totals; total = hit.total; cacheHdr = 'hit';
        } else {
          const res = await provider.getFacetTotals(q); totals = res.totals; total = res.total; cacheHdr = 'miss';
          setCache(key, { totals, total }, DEFAULT_TTL_MS);
        }
      } else {
        const res = await provider.getFacetTotals(q); totals = res.totals; total = res.total;
      }
      const t1 = performance.now();

      if (process.env.DIXIS_METRICS === '1') {
        const qLen = q.q ? q.q.length : 0;
        const status = q.status || 'any';
        const fromD = q.fromDate ? '1' : '0';
        const toD = q.toDate ? '1' : '0';
        // ΜΗΝ log-άρεις την q τιμή (PII). Μόνο μήκος & flags.
        console.info(`[AG105][facets] provider=pg ms=${(t1-t0).toFixed(1)} total=${total} status=${status} qLen=${qLen} fromDate=${fromD} toDate=${toD}`);
      }

      // Σημείωση: κρατάμε το ίδιο σχήμα απόκρισης
      return NextResponse.json({ totals, total, provider: 'pg' }, { status: 200, headers: { 'Cache-Control': 'no-store', ...(process.env.DIXIS_CACHE==='1' ? { 'X-Dixis-Cache': cacheHdr || 'off' } : {}) } });
    } catch (e) {
      // Αν κάτι πάει στραβά (π.χ. δεν υπάρχει @prisma/client), συνεχίζουμε με το υφιστάμενο demo flow
      console.warn('AG97.2 fallback to demo:', e);
    }
  }
  const status = url.searchParams.get('status') || undefined;
  const q = url.searchParams.get('q') || undefined;
  const fromDate = url.searchParams.get('fromDate') || undefined;
  const toDate = url.searchParams.get('toDate') || undefined;
  const sort = (url.searchParams.get('sort') || '-createdAt') as ListParams['sort'];

  const mode = forceDemo ? 'demo' : (process.env.DIXIS_DATA_SRC || (process.env.CI ? 'sqlite' : 'demo'));
  const repo = getOrdersRepo(mode);

  const pageSize = 200;
  let page = 1;
  const totals = new Map<string, number>();
  let total = 0;

  for (;;) {
    const res = await repo.list({ status: status as any, q, fromDate, toDate, sort, page, pageSize });
    if (!total) total = res.count || 0;
    for (const r of res.items) {
      const st = (r as any).status ?? 'unknown';
      totals.set(st, (totals.get(st) || 0) + 1);
    }
    if (res.items.length < pageSize) break;
    page += 1;
    if ((page - 1) * pageSize >= total && total > 0) break;
    if (page > 10000) break; // safety
  }

  const obj: Record<string, number> = {};
  for (const [k, v] of totals.entries()) obj[k] = v;

  return NextResponse.json({ totals: obj, total }, { headers: { 'Cache-Control': 'no-store' } });
}
