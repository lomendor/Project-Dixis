import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

function guard() {
  // SECURITY: Block in production unless DIXIS_DEV override
  const isProd = process.env.DIXIS_ENV === 'production' || process.env.NODE_ENV === 'production';
  if (isProd && process.env.DIXIS_DEV !== '1') {
    return (
      <main>
        <h1>404</h1>
        <p>Not found.</p>
      </main>
    );
  }
  return null;
}

export default async function Page() {
  const g = guard();
  if (g) return g;

  const now = new Date();
  const t1h = new Date(now.getTime() - 1 * 3600_000);
  const t24h = new Date(now.getTime() - 24 * 3600_000);
  const t7d = new Date(now.getTime() - 7 * 24 * 3600_000);

  // Notifications aggregates
  const [q1, q24, q7, backlog] = await Promise.all([
    prisma.notification.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { createdAt: { gte: t1h } }
    }),
    prisma.notification.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { createdAt: { gte: t24h } }
    }),
    prisma.notification.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { createdAt: { gte: t7d } }
    }),
    prisma.notification.count({ where: { status: 'QUEUED' } })
  ]);

  // Fetch top templates using raw query (groupBy type inference issues)
  const tplTop = await prisma.$queryRaw<Array<{ template: string, count: bigint }>>`
    SELECT template, COUNT(*) as count
    FROM "Notification"
    WHERE "createdAt" >= ${t24h}
    GROUP BY template
    ORDER BY count DESC
    LIMIT 5
  `;

  // Fetch top errors manually (groupBy on nullable field causes TS issues)
  const errTop = await prisma.$queryRaw<Array<{ error: string | null, count: bigint }>>`
    SELECT error, COUNT(*) as count
    FROM "Notification"
    WHERE status = 'FAILED' AND "createdAt" >= ${t24h}
    GROUP BY error
    ORDER BY count DESC
    LIMIT 5
  `;

  // Events aggregates using raw queries (groupBy type inference issues)
  const e24 = await prisma.$queryRaw<Array<{ type: string, count: bigint }>>`
    SELECT type, COUNT(*) as count
    FROM "Event"
    WHERE "createdAt" >= ${t24h}
    GROUP BY type
    ORDER BY count DESC
  `;
  const e7 = await prisma.$queryRaw<Array<{ type: string, count: bigint }>>`
    SELECT type, COUNT(*) as count
    FROM "Event"
    WHERE "createdAt" >= ${t7d}
    GROUP BY type
    ORDER BY count DESC
  `;

  // Worker throughput (last hour = SENT in last hour)
  const throughput1h = await prisma.notification.count({
    where: { sentAt: { gte: t1h }, status: 'SENT' }
  });

  // RateLimit approximation (24h buckets for cron/dev)
  const rlCron = await prisma.rateLimit.count({
    where: { name: 'cron-run', createdAt: { gte: t24h } }
  });
  const rlDev = await prisma.rateLimit.count({
    where: { name: 'dev-deliver', createdAt: { gte: t24h } }
  });

  // helpers
  const mapCnt = (arr: any[], st: string) =>
    (arr.find(x => x.status === st)?._count?._all as number) || 0;
  const sent24 = mapCnt(q24, 'SENT');
  const fail24 = mapCnt(q24, 'FAILED');
  const successRate24 =
    sent24 + fail24 > 0 ? Math.round((sent24 * 100) / (sent24 + fail24)) : 100;

  return (
    <main style={{ display: 'grid', gap: 16, padding: '2rem' }}>
      <h1>OPS · Metrics</h1>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
          gap: 12
        }}
      >
        <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
          <div>Backlog (QUEUED)</div>
          <strong style={{ fontSize: 24 }}>{backlog}</strong>
          <div style={{ color: '#6b7280' }}>Ειδοποιήσεις σε αναμονή</div>
        </div>
        <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
          <div>Success rate (24h)</div>
          <strong style={{ fontSize: 24 }}>{successRate24}%</strong>
          <div style={{ color: '#6b7280' }}>SENT vs FAILED (24h)</div>
        </div>
        <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
          <div>Throughput (1h)</div>
          <strong style={{ fontSize: 24 }}>{throughput1h}</strong>
          <div style={{ color: '#6b7280' }}>Αποστολές την τελευταία ώρα</div>
        </div>
        <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
          <div>RateLimit buckets (24h)</div>
          <strong style={{ fontSize: 24 }}>{rlCron + rlDev}</strong>
          <div style={{ color: '#6b7280' }}>cron + dev deliver</div>
        </div>
      </section>

      <section>
        <h2>Notifications</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Παράθυρο</th>
              <th>QUEUED</th>
              <th>SENT</th>
              <th>FAILED</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1h</td>
              <td>{mapCnt(q1, 'QUEUED')}</td>
              <td>{mapCnt(q1, 'SENT')}</td>
              <td>{mapCnt(q1, 'FAILED')}</td>
            </tr>
            <tr>
              <td>24h</td>
              <td>{mapCnt(q24, 'QUEUED')}</td>
              <td>{mapCnt(q24, 'SENT')}</td>
              <td>{mapCnt(q24, 'FAILED')}</td>
            </tr>
            <tr>
              <td>7d</td>
              <td>{mapCnt(q7, 'QUEUED')}</td>
              <td>{mapCnt(q7, 'SENT')}</td>
              <td>{mapCnt(q7, 'FAILED')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Top Templates (24h)</h2>
        <ul>
          {tplTop.map((t: any) => (
            <li key={t.template}>
              <strong>{t.template}</strong> — {Number(t.count)}
            </li>
          ))}
        </ul>

        <h2>Top Errors (24h)</h2>
        <ul>
          {errTop.map((e: any, i: number) => (
            <li key={i}>
              {e.error || '—'} — {Number(e.count)}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Events</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <h3>24h</h3>
            <ul>
              {e24.map((e: any) => (
                <li key={e.type}>
                  <strong>{e.type}</strong> — {Number(e.count)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>7d</h3>
            <ul>
              {e7.map((e: any) => (
                <li key={e.type}>
                  <strong>{e.type}</strong> — {Number(e.count)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
