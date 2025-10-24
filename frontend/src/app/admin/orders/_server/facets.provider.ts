'use server';

export type FacetQuery = {
  status?: string;
  q?: string;
  fromDate?: string;
  toDate?: string;
  sort?: string;
};

export type FacetTotals = {
  totals: Record<string, number>;
  total: number;
};

export interface FacetProvider {
  name: 'demo' | 'pg';
  getFacetTotals(q: FacetQuery): Promise<FacetTotals>;
}

/** Χαρτογράφηση φίλτρων σε Prisma where (τύποι ως any για να μην δεσμευτούμε στο compile-time) */
export function buildWhereClause(q: FacetQuery): any {
  const where: any = {};
  if (q.status) where.status = q.status;
  if (q.fromDate || q.toDate) {
    where.createdAt = {};
    if (q.fromDate) where.createdAt.gte = new Date(q.fromDate);
    if (q.toDate) where.createdAt.lte = new Date(q.toDate);
  }
  if (q.q && q.q.trim()) {
    const needle = q.q.trim();
    // Προτάσεις από AG97-prep: id ή buyerName ή buyerPhone
    where.OR = [
      { id: needle },
      { buyerName: { contains: needle, mode: 'insensitive' } },
      { buyerPhone: { contains: needle, mode: 'insensitive' } },
    ];
  }
  return where;
}

/** Μετατροπή αποτελεσμάτων groupBy σε FacetTotals */
export function transformToFacetTotals(grouped: Array<{ status: string; _count: { _all: number } }>, total: number): FacetTotals {
  const totals: Record<string, number> = {};
  for (const row of grouped) {
    totals[row.status ?? 'unknown'] = row._count?._all ?? 0;
  }
  return { totals, total };
}

/**
 * Δημιουργεί PG provider με dependency injection του Prisma (ώστε να ΜΗΝ γίνεται import εδώ).
 * Χρήση: const pg = createPgFacetProvider(()=>prisma)
 * Δεν γίνεται wiring από το getFacetProvider() ακόμα (AG97.2 θα το ενεργοποιήσει).
 */
export function createPgFacetProvider(getPrisma: () => any): FacetProvider {
  return {
    name: 'pg',
    async getFacetTotals(q: FacetQuery): Promise<FacetTotals> {
      const prisma = getPrisma();
      const where = buildWhereClause(q);

      const grouped = await prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      });

      const total = await prisma.order.count({ where });

      return transformToFacetTotals(grouped, total);
    },
  };
}

/**
 * Σκελετός provider. Default: 'demo' (placeholder, μηδενικά).
 * Στο AG97.1 υλοποιούμε 'pg' (Prisma/SQL) και θα γίνει wiring στο API route.
 */
export function getFacetProvider(): FacetProvider {
  const mode = process.env.DIXIS_AGG_PROVIDER === 'pg' ? 'pg' : 'demo';

  if (mode === 'pg') {
    // AG97.1: ο pg provider υπάρχει, αλλά ΔΕΝ γίνεται αυτόματο wiring εδώ.
    // AG97.2 θα κουμπώσει τον provider στο API route.
    return {
      name: 'pg',
      async getFacetTotals(_q: FacetQuery) {
        throw new Error('AG97.2 pending: wire PG provider in API route');
      },
    };
  }

  // Demo fallback: placeholder χωρίς αλλαγή συμπεριφοράς
  return {
    name: 'demo',
    async getFacetTotals(_q: FacetQuery): Promise<FacetTotals> {
      return { totals: {}, total: 0 };
    },
  };
}
