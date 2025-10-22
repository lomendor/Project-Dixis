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

export default function AdminOrdersMain() {
  const options = [
    { key:'pending',   label:'Σε αναμονή' },
    { key:'paid',      label:'Πληρωμή'    },
    { key:'shipped',   label:'Απεστάλη'   },
    { key:'cancelled', label:'Ακυρώθηκε'  },
    { key:'refunded',  label:'Επιστροφή'  },
  ] as const;
  const allowed = options.map(o=>o.key) as ReadonlyArray<Status>;

  // URL state
  const [active, setActive] = React.useState<Status|null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sort, setSort] = React.useState<'createdAt'|'-createdAt'>('-createdAt');
  const [mode, setMode] = React.useState<'demo'|'pg'|'sqlite'|'auto'>('auto');

  const [q, setQ] = React.useState('');
  const [fromDate, setFromDate] = React.useState<string>('');
  const [toDate, setToDate] = React.useState<string>('');

  const [rows, setRows]   = React.useState<Row[]>(LOCAL_DEMO);
  const [count, setCount] = React.useState<number>(LOCAL_DEMO.length);
  const [usingApi, setUsingApi] = React.useState(false);
  const [errNote, setErrNote]   = React.useState<string|null>(null);

  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const v = url.searchParams.get('status');
      setActive(v && allowed.includes(v as Status) ? (v as Status) : null);
      setPage(Math.max(1, parseInt(url.searchParams.get('page') || '1', 10)));
      setPageSize(Math.max(1, Math.min(100, parseInt(url.searchParams.get('pageSize') || '10', 10))));
      const s = (url.searchParams.get('sort') || '-createdAt') as ('createdAt'|'-createdAt');
      setSort(s === 'createdAt' ? 'createdAt' : '-createdAt');
      const m = (url.searchParams.get('mode') || 'auto') as any;
      setMode(['demo','pg','sqlite'].includes(m) ? m : 'auto');
      setQ(url.searchParams.get('q') || '');
      setFromDate(url.searchParams.get('fromDate') || '');
      setToDate(url.searchParams.get('toDate') || '');
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const writeParam = (key: string, value: string|null) => {
    const url = new URL(window.location.href);
    if (value===null || value==='') url.searchParams.delete(key); else url.searchParams.set(key, value);
    history.replaceState(null, '', url);
  };

  React.useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const useApi = url.searchParams.get('useApi') === '1';
        setUsingApi(useApi);
        setErrNote(null);
        if (!useApi) {
          let demo = LOCAL_DEMO.filter(o => !active || o.status===active);
          if (q) {
            const qq = q.toLowerCase();
            demo = demo.filter(o => o.id.toLowerCase().includes(qq) || o.customer.toLowerCase().includes(qq));
          }
          // (τοπικό demo: αγνοούμε from/to για απλότητα δεδομένων)
          const start = (page-1)*pageSize; const res = demo.slice(start, start+pageSize);
          setRows(res); setCount(demo.length);
          return;
        }
        const qs = new URLSearchParams();
        if (active) qs.set('status', active);
        if (q) qs.set('q', q);
        if (fromDate) qs.set('fromDate', fromDate);
        if (toDate) qs.set('toDate', toDate);
        qs.set('page', String(page));
        qs.set('pageSize', String(pageSize));
        qs.set('sort', sort);
        if (mode === 'demo' || mode === 'auto') qs.set('demo','1');

        const res = await fetch(`/api/admin/orders?${qs.toString()}`, { cache:'no-store' });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json.items) ? json.items as Row[] : [];
        setRows(items);
        setCount(typeof json.count==='number' ? json.count : items.length);
      } catch (e:any) {
        setErrNote(e?.message || 'API error'); setUsingApi(false);
        let demo = LOCAL_DEMO.filter(o => !active || o.status===active);
        if (q) {
          const qq = q.toLowerCase();
          demo = demo.filter(o => o.id.toLowerCase().includes(qq) || o.customer.toLowerCase().includes(qq));
        }
        const start = (page-1)*pageSize; const res = demo.slice(start, start+pageSize);
        setRows(res); setCount(demo.length);
      }
    };
    run();
  }, [active, page, pageSize, sort, mode, q, fromDate, toDate]);

  const onChangeStatus = (v: string | null) => {
    writeParam('status', v); setActive(v as Status | null); setPage(1);
  };
  const toggleSort = () => {
    const next = sort === '-createdAt' ? 'createdAt' : '-createdAt';
    writeParam('sort', next); setSort(next);
  };
  const onPageSize = (n: number) => { writeParam('pageSize', String(n)); setPageSize(n); setPage(1); };
  const go = (delta: number) => {
    const maxPage = Math.max(1, Math.ceil(count / pageSize));
    const next = Math.min(maxPage, Math.max(1, page + delta));
    writeParam('page', String(next)); setPage(next);
  };
  const onSubmitFilters = (e: React.FormEvent) => {
    e.preventDefault();
    writeParam('q', q || null);
    writeParam('fromDate', fromDate || null);
    writeParam('toDate', toDate || null);
    setPage(1);
  };

  const maxPage = Math.max(1, Math.ceil(count / pageSize));

  return (
    <main style={{padding:16}}>
      <h2 style={{margin:'0 0 12px 0'}}>Παραγγελίες {usingApi ? `(API${mode!=='auto'?':'+mode:''})` : '(τοπικό demo)'}</h2>

      <form onSubmit={onSubmitFilters} style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', margin:'8px 0 12px 0'}}>
        <FilterChips options={options as any} active={active} onChange={onChangeStatus} />
        <input
          value={q} onChange={e=>setQ(e.target.value)} placeholder="Αναζήτηση (Order ID ή Πελάτης)"
          style={{padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', fontSize:12}}
        />
        <label style={{fontSize:12}}>Από:&nbsp;<input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} /></label>
        <label style={{fontSize:12}}>Έως:&nbsp;<input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} /></label>
        <button type="submit" style={{padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600}}>Εφαρμογή</button>
        <button type="button" onClick={()=>{ setQ(''); setFromDate(''); setToDate(''); writeParam('q',null); writeParam('fromDate',null); writeParam('toDate',null); setPage(1); }} style={{padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:12}}>Καθαρισμός</button>
        <button type="button" onClick={toggleSort} data-testid="toggle-sort"
          style={{padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600}}>
          Ταξινόμηση: {sort==='-createdAt' ? 'Νεότερα πρώτα' : 'Παλαιότερα πρώτα'}
        </button>
        <label style={{fontSize:12}}>
          Page size:&nbsp;
          <select value={pageSize} onChange={e=>onPageSize(parseInt(e.target.value,10))} data-testid="page-size">
            <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
          </select>
        </label>
      </form>

      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', margin:'8px 0'}}>
        <div data-testid="results-count" style={{fontSize:12,color:'#555'}}>Σύνολο: {count} · Σελίδα {page}/{maxPage}</div>
        <div style={{display:'flex', gap:8}}>
          <button type="button" onClick={()=>go(-1)} disabled={page<=1}
            style={{padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:12}}>« Προηγ.</button>
          <button type="button" onClick={()=>go(+1)} disabled={page>=maxPage}
            style={{padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:12}}>Επόμ. »</button>
        </div>
      </div>

      {errNote && <div style={{fontSize:12,color:'#a33',margin:'6px 0'}}>Σημείωση: {errNote} — έγινε fallback.</div>}

      <div role="table" style={{display:'grid', gap:8}}>
        <div role="row" style={{display:'grid', gridTemplateColumns:'1.2fr 2fr 1fr 1.2fr', gap:12, fontWeight:600, fontSize:12, color:'#555'}}>
          <div>Order</div><div>Πελάτης</div><div>Σύνολο</div><div>Κατάσταση</div>
        </div>
        {rows.map(o=>(
          <div key={o.id} role="row" data-testid={`row-${o.status}`} style={{display:'grid', gridTemplateColumns:'1.2fr 2fr 1fr 1.2fr', gap:12, alignItems:'center', padding:'8px 0', borderTop:'1px solid #eee'}}>
            <div>{o.id}</div><div>{o.customer}</div><div>{o.total}</div><div><StatusChip status={o.status} /></div>
          </div>
        ))}
        {rows.length===0 && <div data-testid="no-results" style={{padding:16, color:'#666'}}>Καμία παραγγελία για τα επιλεγμένα φίλτρα.</div>}
      </div>
    </main>
  );
}
