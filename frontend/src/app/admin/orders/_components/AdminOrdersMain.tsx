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
  const toCSV = (rows: Row[]) => {
    const esc = (v: any) => `"${String(v).replace(/"/g, '""')}"`;
    const head = ['Order','Πελάτης','Σύνολο','Κατάσταση'];
    const lines = [head, ...rows.map(r => [r.id, r.customer, r.total, r.status])].map(r => r.map(esc).join(','));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const ts = new Date().toISOString().slice(0,10);
    const a = document.createElement('a');
    a.href = url; a.download = `orders_${ts}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  };
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
  React.useEffect(()=>{try{const r=localStorage.getItem('orders.pageSize.v1'); if(r) setPageSize(Math.max(1,Math.min(100,parseInt(r,10)||10)));}catch{}},[]);
  React.useEffect(()=>{try{localStorage.setItem('orders.pageSize.v1',String(pageSize));}catch{}},[pageSize]);
  const [sort, setSort] = React.useState<'createdAt'|'-createdAt'>('-createdAt');
  React.useEffect(()=>{try{const r=localStorage.getItem('orders.sort.v1'); if(r==='createdAt'||r==='-createdAt') setSort(r as any);}catch{}},[]);
  React.useEffect(()=>{try{localStorage.setItem('orders.sort.v1',sort);}catch{}},[sort]);
  const [mode, setMode] = React.useState<'demo'|'pg'|'sqlite'|'auto'>('auto');

  const [q, setQ] = React.useState('');
  const [fromDate, setFromDate] = React.useState<string>('');
  const [toDate, setToDate] = React.useState<string>('');

  const [rows, setRows]   = React.useState<Row[]>(LOCAL_DEMO);
  const [facetTotals, setFacetTotals] = React.useState<Record<string, number> | null>(null);
  const [facetTotalAll, setFacetTotalAll] = React.useState<number | null>(null);
  const [isFacetLoading, setIsFacetLoading] = React.useState(false);
  const activeStatus = React.useMemo(() => {
    if (typeof window === 'undefined') return null;
    const u = new URL(window.location.href);
    return u.searchParams.get('status');
  }, [pageSize, sort]);

  // Quick totals (per current page)
  const statusOrder = React.useMemo(() => {
    const seen = new Map<string, number>();
    rows.forEach(r => { if (r?.status) seen.set(r.status, (seen.get(r.status)||0) + 1); });
    // σταθερή διάταξη: φθίνουσα κατά count, αλφαβητικά ως δεύτερο κριτήριο
    return Array.from(seen.entries()).sort((a,b)=> b[1]-a[1] || String(a[0]).localeCompare(String(b[0]))).map(([k])=>k);
  }, [rows]);

  const pageTotals = React.useMemo(() => {
    const acc = new Map<string, number>();
    rows.forEach(r => acc.set(r.status, (acc.get(r.status)||0) + 1));
    const total = rows.length;
    return { acc, total };
  }, [rows]);


  // Column visibility (persisted)
  type ColKey = 'id'|'customer'|'total'|'status';
  const DEFAULT_COLS: Record<ColKey, boolean> = { id:true, customer:true, total:true, status:true };
  const [cols, setCols] = React.useState<Record<ColKey, boolean>>(DEFAULT_COLS);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('orders.visibleColumns.v1');
      if (raw) setCols({ ...DEFAULT_COLS, ...JSON.parse(raw) });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    try { localStorage.setItem('orders.visibleColumns.v1', JSON.stringify(cols)); } catch {}
  }, [cols]);

  const COLS = [
    { key:'id',       label:'Order',      width:'1.2fr' },
    { key:'customer', label:'Πελάτης',    width:'2fr'   },
    { key:'total',    label:'Σύνολο',     width:'1fr'   },
    { key:'status',   label:'Κατάσταση',  width:'1.2fr' },
  ] as const;

  const visible = COLS.filter(c => cols[c.key as ColKey]);
  const grid = visible.map(c=>c.width).join(' ');

  const [count, setCount] = React.useState<number>(LOCAL_DEMO.length);
  const [usingApi, setUsingApi] = React.useState(false);

  const fetchFacets = async () => {
    try {
      setIsFacetLoading(true);
      const u = new URL(window.location.href);
      const qs = new URLSearchParams();
      const status = u.searchParams.get('status'); if (status) qs.set('status', status);
      const q = u.searchParams.get('q'); if (q) qs.set('q', q);
      const fromDate = u.searchParams.get('fromDate'); if (fromDate) qs.set('fromDate', fromDate);
      const toDate = u.searchParams.get('toDate'); if (toDate) qs.set('toDate', toDate);
      const sort = u.searchParams.get('sort') || '-createdAt'; qs.set('sort', sort);
      // σε demo ή useApi=1, ζήτα demo=1 ώστε να μη χτυπήσει πραγματική DB
      if (u.searchParams.get('mode')==='demo' || u.searchParams.get('useApi')==='1') qs.set('demo','1');
      const res = await fetch(`/api/admin/orders/facets?${qs.toString()}`, { cache:'no-store' });
      if (!res.ok) throw new Error('facets failed');
      const json = await res.json();
      setFacetTotals(json.totals || {});
      setFacetTotalAll(typeof json.total === 'number' ? json.total : null);
    } catch (e) {
      setFacetTotals(null);
      setFacetTotalAll(null);
    } finally {
      setIsFacetLoading(false);
    }
  };

  React.useEffect(() => {
    // Όταν αλλάξουν τα query params στη σελίδα (π.χ. με το form), φέρε νέα facets.
    fetchFacets();
    // Παρατηρητής για αλλαγές στο URL (π.χ. pushState από χειρισμούς)
    const obs = new MutationObserver(() => {});
    // Δεν έχουμε router hook εδώ — βασιζόμαστε στις ενέργειες του χρήστη που πυροδοτούν reload/replace.
    // Αν χρειαστεί, θα βάλουμε πιο "γερό" listener σε επόμενο pass.
    return () => { obs.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, sort]); // proxies για re-run — τα πραγματικά φίλτρα είναι στο URL

  const [isLoading, setIsLoading] = React.useState(false);
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
      setIsLoading(true);
      const startTime=Date.now();
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
          const delay1=Math.max(0,150-(Date.now()-startTime)); await new Promise(r=>setTimeout(r,delay1));
          setIsLoading(false);
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
        setRows(items); setCount(typeof json.count==='number' ? json.count : items.length);
        const delay2=Math.max(0,150-(Date.now()-startTime)); await new Promise(r=>setTimeout(r,delay2));
        setIsLoading(false);
      } catch (e:any) {
        setErrNote(e?.message || 'API error'); setUsingApi(false);
        let demo = LOCAL_DEMO.filter(o => !active || o.status===active);
        if (q) {
          const qq = q.toLowerCase();
          demo = demo.filter(o => o.id.toLowerCase().includes(qq) || o.customer.toLowerCase().includes(qq));
        }
        const start = (page-1)*pageSize; const res = demo.slice(start, start+pageSize);
        setRows(res); setCount(demo.length);
        const delay3=Math.max(0,150-(Date.now()-startTime)); await new Promise(r=>setTimeout(r,delay3));
        setIsLoading(false);
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

  const SkeletonRow: React.FC = () => (
    <div role="row" aria-busy style={{display:'grid', gridTemplateColumns:grid, gap:12, alignItems:'center', padding:'8px 0', borderTop:'1px solid #eee'}}>
      {visible.map(c=> <div key={String(c.key)} style={{height:12, borderRadius:6, background:'linear-gradient(90deg,#eee,#f5f5f5,#eee)', backgroundSize:'200% 100%', animation:'s 1.2s linear infinite'}} />)}
    </div>
  );
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

  const SkeletonRow: React.FC = () => (
    <div role="row" aria-busy style={{display:'grid', gridTemplateColumns:grid, gap:12, alignItems:'center', padding:'8px 0', borderTop:'1px solid #eee'}}>
      {visible.map(c=> <div key={String(c.key)} style={{height:12, borderRadius:6, background:'linear-gradient(90deg,#eee,#f5f5f5,#eee)', backgroundSize:'200% 100%', animation:'s 1.2s linear infinite'}} />)}
    </div>
  );

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
        
        <button type="button" onClick={()=>toCSV(rows)} data-testid="export-csv"
          style={{padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600}}>
          Εξαγωγή CSV
        </button>
        
        <button
          type="button"
          onClick={()=>{
            const url = new URL(window.location.href);
            const qs = new URLSearchParams();
            const status = url.searchParams.get('status'); if (status) qs.set('status', status);
            const q = url.searchParams.get('q'); if (q) qs.set('q', q);
            const fromDate = url.searchParams.get('fromDate'); if (fromDate) qs.set('fromDate', fromDate);
            const toDate = url.searchParams.get('toDate'); if (toDate) qs.set('toDate', toDate);
            const sort = url.searchParams.get('sort') || '-createdAt'; qs.set('sort', sort);
            if (url.searchParams.get('mode')==='demo' || url.searchParams.get('useApi')==='1') qs.set('demo','1');
            const a = document.createElement('a');
            a.href = `/api/admin/orders/export?${qs.toString()}`;
            a.rel = 'noopener';
            document.body.appendChild(a); a.click(); a.remove();
          }}
          data-testid="export-csv-full"
          style={{padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600}}
        >
          Εξαγωγή CSV (Full)
        </button>
        <label style={{fontSize:12}}>
          Page size:&nbsp;
          <select value={pageSize} onChange={e=>onPageSize(parseInt(e.target.value,10))} data-testid="page-size">
            <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
          </select>
        </label>
      </form>

      <div style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
        {COLS.map(c=>(
          <label key={c.key} style={{fontSize:12}}>
            <input
              type="checkbox"
              checked={cols[c.key as ColKey]}
              onChange={e=>setCols(v=>({ ...v, [c.key]: e.target.checked }))}
              data-testid={`col-toggle-${c.key}`}
            />&nbsp;{c.label}
          </label>
        ))}
      </div>

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


      {/* Quick totals (τρέχουσα σελίδα) */}
      {pageTotals.total > 0 && (
        <div data-testid="quick-totals" style={{display:'flex', gap:8, flexWrap:'wrap', margin:'6px 0 10px 0', position:'sticky', top:0, zIndex:20, background:'#fff', padding:'6px 0', borderBottom:'1px solid #eee'}}>
          {statusOrder.map(st => (
            <div key={st} data-testid={`total-${st}`} style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 8px', border:'1px solid #e5e5e5', borderRadius:999}}>
              <span style={{width:8, height:8, borderRadius:999, background:'#0ea5e9'}} aria-hidden />
              <span style={{fontSize:12}}>{st}</span>
              <strong style={{fontSize:12}}>{pageTotals.acc.get(st) || 0}</strong>
            </div>
          ))}
          <div data-testid="total-all" style={{marginLeft:4, fontSize:12, color:'#555'}}>Σύνολο: <strong>{pageTotals.total}</strong></div>
        </div>
      )}


      {/* Facet totals (ALL filtered results) */}
      {facetTotals && facetTotalAll !== null && (
        <div data-testid="facet-totals" style={{display:'flex', gap:8, flexWrap:'wrap', margin:'8px 0 4px 0', position:'sticky', top:0, zIndex:20, background:'#fff', padding:'6px 0', borderBottom:'1px solid #eee'}} onClick={(e)=>{ const t=(e.target as HTMLElement).closest("[data-st]") as HTMLElement|null; if(!t) return; const st=t.getAttribute("data-st"); if(!st) return; const u=new URL(window.location.href); const cur=u.searchParams.get("status"); if(cur===st){ u.searchParams.delete("status"); } else { u.searchParams.set("status", st); } window.location.assign(u.toString()); }}>
          {Object.entries(facetTotals).sort((a,b)=> b[1]-a[1] || String(a[0]).localeCompare(String(b[0]))).map(([st,count])=>(
            <div key={st} data-st={st} data-testid={`facet-chip-${st}`} data-active={(activeStatus===st)?'1':'0'} aria-pressed={activeStatus===st}
          style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 8px', border:'1px solid', borderColor:(activeStatus===st)?'#10b981':'#e5e5e5', background:(activeStatus===st)?'#ecfdf5':'#fff', borderRadius:999, cursor:'pointer', userSelect:'none'}}>
              <span style={{width:8, height:8, borderRadius:999, background:'#10b981'}} aria-hidden />
              <span style={{fontSize:12}}>{st}</span>
              <strong style={{fontSize:12}}>{count}</strong>
            </div>
          ))}
          {activeStatus && (
            <div data-clear="1" data-testid="facet-chip-clear"
                 style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 8px', border:'1px solid #e5e5e5', borderRadius:999, cursor:'pointer'}}>
              Καθαρισμός ✕
            </div>
          )}
          <div data-testid="facet-total-all" style={{marginLeft:4, fontSize:12, color:'#444'}}>Σύνολο (όλα): <strong>{facetTotalAll}</strong></div>
        </div>
      )}
      {isFacetLoading && (
        <div data-testid="facet-loading" style={{fontSize:12, color:'#777', margin:'6px 0'}}>Φόρτωση συνόλων…</div>
      )}

      <div role="table" style={{display:'grid', gap:8}}>
        <div role="row" style={{display:'grid', gridTemplateColumns:'1.2fr 2fr 1fr 1.2fr', gap:12, fontWeight:600, fontSize:12, color:'#555'}}>
          <div>Order</div><div>Πελάτης</div><div>Σύνολο</div><div>Κατάσταση</div>
        </div>
        {rows.map(o=>(
          <div key={o.id} role="row" data-testid={`row-${o.status}`} style={{display:'grid', gridTemplateColumns:'1.2fr 2fr 1fr 1.2fr', gap:12, alignItems:'center', padding:'8px 0', borderTop:'1px solid #eee'}}>
            <div>{o.id}</div><div>{o.customer}</div><div>{o.total}</div><div><StatusChip status={o.status} /></div>
          </div>
        ))}
        {rows.length===0 && <div data-testid="no-results" style={{padding:24, color:'#666', border:'1px dashed #ccc', borderRadius:8}}>Καμία παραγγελία για τα επιλεγμένα φίλτρα.</div>}
      </div>
    
      <style>{`@keyframes s{0%{background-position:0 0}100%{background-position:-200% 0}}`}</style>
    </main>
  );
}
