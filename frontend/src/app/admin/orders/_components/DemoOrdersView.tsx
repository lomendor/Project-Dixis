'use client';
import React from 'react';
import StatusChip from '@/components/StatusChip';
import FilterChips from '@/components/FilterChips';

type Status = 'pending'|'paid'|'shipped'|'cancelled'|'refunded';
type Row = { id: string; customer: string; total: string; status: Status };

const LOCAL_DEMO: Row[] = [
  { id:'A-2001', customer:'Μαρία',   total:'€42.00',  status:'pending'  },
  { id:'A-2002', customer:'Γιάννης', total:'€99.90',  status:'paid'     },
  { id:'A-2003', customer:'Ελένη',   total:'€12.00',  status:'refunded' },
  { id:'A-2004', customer:'Νίκος',   total:'€59.00',  status:'cancelled'},
  { id:'A-2005', customer:'Άννα',    total:'€19.50',  status:'shipped'  },
  { id:'A-2006', customer:'Κώστας',  total:'€31.70',  status:'pending'  },
];

export default function DemoOrdersView() {
  const options = [
    { key:'pending',   label:'Σε αναμονή' },
    { key:'paid',      label:'Πληρωμή'    },
    { key:'shipped',   label:'Απεστάλη'   },
    { key:'cancelled', label:'Ακυρώθηκε'  },
    { key:'refunded',  label:'Επιστροφή'  },
  ] as const;
  const allowed = options.map(o=>o.key) as ReadonlyArray<Status>;

  const [active, setActive] = React.useState<Status|null>(null);
  const [rows, setRows]   = React.useState<Row[]>(LOCAL_DEMO);
  const [usingApi, setUsingApi] = React.useState(false);
  const [errNote, setErrNote]   = React.useState<string|null>(null);

  // Διαβάζουμε flags/status από URL
  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const v = url.searchParams.get('status');
      setActive(v && allowed.includes(v as Status) ? (v as Status) : null);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Αν υπάρχει ?useApi=1 → κάνε fetch /api/admin/orders (demo gated για σταθερότητα: ?demo=1)
  React.useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const useApi = url.searchParams.get('useApi') === '1';
        setUsingApi(useApi);
        setErrNote(null);
        if (!useApi) {
          // fallback σε τοπικά demo data
          setRows(LOCAL_DEMO.filter(o => !active || o.status===active));
          return;
        }
        const qs = new URLSearchParams();
        qs.set('demo','1'); // εγγυημένη διαθεσιμότητα μέχρι να μπει PG/SQLite
        if (active) qs.set('status', active);
        const res = await fetch(`/api/admin/orders?${qs.toString()}`, { cache:'no-store' });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json.items) ? json.items as Row[] : [];
        setRows(items);
      } catch (e:any) {
        setErrNote(e?.message || 'API error');
        // ασφαλές fallback
        setRows(LOCAL_DEMO.filter(o => !active || o.status===active));
        setUsingApi(false);
      }
    };
    run();
  }, [active]);

  const onChange = (v: string | null) => {
    try {
      const url = new URL(window.location.href);
      if (v) url.searchParams.set('status', String(v));
      else   url.searchParams.delete('status');
      // κρατάμε το demo flag για σταθερό E2E
      url.searchParams.set('statusFilterDemo','1');
      history.replaceState(null, '', url);
      setActive(v as Status | null);
    } catch {}
  };

  return (
    <main style={{padding:16}}>
      <h2 style={{margin:'0 0 12px 0'}}>Παραγγελίες {usingApi ? '(API)' : '(τοπικό demo)'}</h2>

      <div style={{margin:'8px 0 16px 0'}}>
        <FilterChips options={options as any} active={active} onChange={onChange} />
      </div>

      {/* Toolbar: counter + clear */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', margin:'8px 0 8px 0'}}>
        <div data-testid="results-count" style={{fontSize:12,color:'#555'}}>Αποτελέσματα: {rows.length}</div>
        {active && (
          <button
            type="button"
            data-testid="clear-filter"
            onClick={()=> onChange(null)}
            style={{padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600}}
          >
            Καθαρισμός
          </button>
        )}
      </div>

      {errNote && <div style={{fontSize:12,color:'#a33',margin:'6px 0'}}>Σημείωση: {errNote} — έγινε fallback.</div>}

      <div role="table" style={{display:'grid', gap:8}}>
        <div role="row" style={{display:'grid', gridTemplateColumns:'1.2fr 2fr 1fr 1.2fr', gap:12, fontWeight:600, fontSize:12, color:'#555'}}>
          <div>Order</div><div>Πελάτης</div><div>Σύνολο</div><div>Κατάσταση</div>
        </div>
        {rows.map(o=>(
          <div key={o.id} role="row" data-testid={`row-${o.status}`} style={{display:'grid', gridTemplateColumns:'1.2fr 2fr 1fr 1.2fr', gap:12, alignItems:'center', padding:'8px 0', borderTop:'1px solid #eee'}}>
            <div>{o.id}</div>
            <div>{o.customer}</div>
            <div>{o.total}</div>
            <div><StatusChip status={o.status} /></div>
          </div>
        ))}
        {rows.length===0 && (
          <div data-testid="no-results" style={{padding:16, color:'#666'}}>Καμία παραγγελία για το επιλεγμένο φίλτρο.</div>
        )}
      </div>
    </main>
  );
}
