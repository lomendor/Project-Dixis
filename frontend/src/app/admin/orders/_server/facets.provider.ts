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

/**
 * Σκελετός provider. Default: 'demo' (placeholder, μηδενικά).
 * Στο AG97.1 υλοποιούμε 'pg' (Prisma/SQL) και θα γίνει wiring στο API route.
 */
export function getFacetProvider(): FacetProvider {
  const mode = process.env.DIXIS_AGG_PROVIDER === 'pg' ? 'pg' : 'demo';

  if (mode === 'pg') {
    // AG97.1: θα μπει πραγματική Postgres aggregation (countByStatus)
    return {
      name: 'pg',
      async getFacetTotals(_q: FacetQuery): Promise<FacetTotals> {
        throw new Error('AG97.1 pending: Postgres aggregation not wired yet');
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
