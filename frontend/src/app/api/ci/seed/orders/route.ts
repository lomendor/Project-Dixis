import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function allow(req: NextRequest) {
  if (process.env.CI === 'true' || process.env.NODE_ENV === 'test') return true;
  const hdr = req.headers.get('x-ci-seed-token');
  const token = process.env.CI_SEED_TOKEN || '';
  return !!hdr && token && hdr === token;
}

export async function POST(req: NextRequest) {
  if (!allow(req)) return new Response('Forbidden', { status: 403 });

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  const url = new URL(req.url);
  const dataset = url.searchParams.get('dataset') || 'facets-basic';

  // καθάρισε προηγούμενα
  await prisma.order.deleteMany({});

  // datasets
  const rows: Array<any> = [];
  if (dataset === 'facets-basic') {
    // 4 pending, 2 shipped, 1 cancelled, 3 processing
    const mk = (id: string, status: string, buyerName: string) => ({
      id, status, buyerName, createdAt: new Date(), updatedAt: new Date()
    });
    rows.push(
      mk('P-101','pending','Alice'),
      mk('P-102','pending','Bob'),
      mk('P-103','pending','Carol'),
      mk('P-104','pending','Dan'),
      mk('S-201','shipped','Eve'),
      mk('S-202','shipped','Frank'),
      mk('C-301','cancelled','Gina'),
      mk('R-401','processing','Hank'),
      mk('R-402','processing','Ivy'),
      mk('R-403','processing','John'),
    );
  }

  await prisma.order.createMany({ data: rows, skipDuplicates: true });

  const total = await prisma.order.count();
  return Response.json({ ok:true, dataset, total }, { status: 200 });
}
