import { NextRequest, NextResponse } from 'next/server';
import { getOrdersRepo } from '@/lib/orders/providers';
import type { ListParams } from '@/lib/orders/providers';
import { createPgFacetProvider, type FacetQuery } from '../../../../admin/orders/_server/facets.provider';
import { prisma } from '@/server/db/prisma';

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

      const { totals, total } = await provider.getFacetTotals(q);
      // Σημείωση: κρατάμε το ίδιο σχήμα απόκρισης
      return NextResponse.json({ totals, total, provider: 'pg' }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
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
