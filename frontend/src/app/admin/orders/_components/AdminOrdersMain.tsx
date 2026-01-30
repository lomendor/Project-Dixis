'use client';
import React from 'react';
import { useOrdersFilters } from '../_hooks/useOrdersFilters';
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

  const [rows, setRows]   = React.useState<Row[]>([]);
  const [facetTotals, setFacetTotals] = React.useState<Record<string, number> | null>(null);
  const [facetTotalAll, setFacetTotalAll] = React.useState<number | null>(null);
  const [isFacetLoading, setIsFacetLoading] = React.useState(false);
  const [density, setDensity] = React.useState<'normal'|'compact'>('normal');
  React.useEffect(() => {
    try { if (typeof window !== 'undefined') {
      const v = window.localStorage.getItem('orders:ui:density');
      if (v === 'compact' || v === 'normal') setDensity(v as any);
    } } catch {}
  }, []);

  // AG95: URL source of truth for filters via hook
  const { filters, paramString, setFilter, clearFilter, clearAll } = useOrdersFilters();
  const activeStatus = filters.status || null;

  // AG96: Local input state for debounced search
  const [qInput, setQInput] = React.useState<string>('');
  React.useEffect(()=>{ setQInput(filters.q || ''); }, [filters.q]);

  /* AG96 debounce search */
  React.useEffect(() => {
    const h = setTimeout(() => {
      // Μόνο αν αλλάζει η τιμή σε σχέση με το filters.q
      if ((filters.q || '') !== qInput) {
        // replace για να μην δημιουργούμε πολλά history entries
        setFilter('q', qInput || undefined, { replace: true });
        // reset page στην 1 όταν αλλάζει το query
        setFilter('page', 1, { replace: true });
      }
    }, 300);
    return () => clearTimeout(h);
  }, [qInput, filters.q, setFilter]);

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

  const [count, setCount] = React.useState<number>(0);
  const [usingApi, setUsingApi] = React.useState(false);

  const fetchFacets = async () => {
    try {
      setIsFacetLoading(true);
      const qs = new URLSearchParams();
      if (filters.status) qs.set('status', filters.status);
      if (filters.q) qs.set('q', filters.q);
      if (filters.fromDate) qs.set('fromDate', filters.fromDate);
      if (filters.toDate) qs.set('toDate', filters.toDate);
      qs.set('sort', filters.sort || '-createdAt');
      // σε demo ή useApi=1, ζήτα demo=1 ώστε να μη χτυπήσει πραγματική DB
      const u = new URL(window.location.href);
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
      // AG99: 120ms delay για ομαλό UX
      setTimeout(() => setIsFacetLoading(false), 120);
    }
  };

  React.useEffect(() => {
    // AG95: refetch facets when filters change (via paramString from hook)
    fetchFacets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramString]); // paramString captures all filter changes from URL

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
        // Default to API; only use demo when explicitly set via ?mode=demo
        const forceDemo = url.searchParams.get('mode') === 'demo';
        setErrNote(null);

        if (forceDemo) {
          // Explicit demo mode requested
          setUsingApi(false);
          let demo = LOCAL_DEMO.filter(o => !active || o.status===active);
          if (q) {
            const qq = q.toLowerCase();
            demo = demo.filter(o => o.id.toLowerCase().includes(qq) || o.customer.toLowerCase().includes(qq));
          }
          const start = (page-1)*pageSize; const res = demo.slice(start, start+pageSize);
          setRows(res); setCount(demo.length);
          const delay1=Math.max(0,150-(Date.now()-startTime)); await new Promise(r=>setTimeout(r,delay1));
          setIsLoading(false);
          return;
        }

        // Default: fetch from real Laravel API (Issue #2540)
        const qs = new URLSearchParams();
        if (active) qs.set('status', active);
        if (q) qs.set('q', q);
        if (fromDate) qs.set('from_date', fromDate);
        if (toDate) qs.set('to_date', toDate);
        qs.set('page', String(page));
        qs.set('per_page', String(pageSize));
        qs.set('sort', sort === 'createdAt' ? 'created_at' : '-created_at');

        // Build headers with Authorization from localStorage
        const headers: Record<string, string> = { 'Accept': 'application/json' };
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/v1/admin/orders?${qs.toString()}`, { cache:'no-store', headers });
        if (res.status === 401 || res.status === 403) {
          // Unauthenticated - show clear message
          setErrNote('Απαιτείται σύνδεση διαχειριστή');
          setUsingApi(false);
          setRows([]); setCount(0);
          const delay2=Math.max(0,150-(Date.now()-startTime)); await new Promise(r=>setTimeout(r,delay2));
          setIsLoading(false);
          return;
        }
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = await res.json();
        // Transform Laravel response to frontend format
        const orders = json.orders || json.data || [];
        const items: Row[] = orders.map((o: Record<string, unknown>) => ({
          id: `A-${o.id}`,
          customer: (o.user as Record<string, unknown>)?.name || (o.user as Record<string, unknown>)?.email || 'N/A',
          total: `€${Number(o.total_amount || 0).toFixed(2)}`,
          status: o.status as Status,
        }));
        const totalCount = json.meta?.total ?? json.total ?? items.length;
        setRows(items); setCount(totalCount);
        setUsingApi(true);
        const delay3=Math.max(0,150-(Date.now()-startTime)); await new Promise(r=>setTimeout(r,delay3));
        setIsLoading(false);
      } catch (e:any) {
        setErrNote(e?.message || 'API error'); setUsingApi(false);
        // On API error, show empty state (no demo fallback in production)
        setRows([]); setCount(0);
        const delay4=Math.max(0,150-(Date.now()-startTime)); await new Promise(r=>setTimeout(r,delay4));
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
      <h2 style={{margin:'0 0 12px 0'}}>Παραγγελίες{usingApi ? '' : (mode === 'demo' ? ' (demo)' : '')}</h2>

      <form onSubmit={onSubmitFilters} style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', margin:'8px 0 12px 0'}}>
        <FilterChips options={options as any} active={active} onChange={onChangeStatus} />
        <input
          value={qInput} onChange={e=>setQInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); setFilter('q', qInput||undefined, { replace:true }); setFilter('page', 1, { replace:true }); } }} placeholder="Αναζήτηση (Order ID ή Πελάτης)" title="Πληκτρολόγησε και περίμενε ~0.3s για αυτόματη εφαρμογή, ή πάτα Enter για άμεση αναζήτηση"
          style={{padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', fontSize:12}}
        />
        <label style={{fontSize:12}}>Από:&nbsp;<input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} /></label>
        <label style={{fontSize:12}}>Έως:&nbsp;<input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} /></label>
        <button type="submit" style={{padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600}}>Εφαρμογή</button>
        <button type="button" onClick={()=>{ setQInput(''); setQ(''); setFromDate(''); setToDate(''); writeParam('q',null); writeParam('fromDate',null); writeParam('toDate',null); setPage(1); }} style={{padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:12}}>Καθαρισμός</button>
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

      {errNote && <div style={{fontSize:12,color:'#a33',margin:'6px 0'}}>{errNote}</div>}


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


      {/* Density toggle */}
      <div style={{display:'flex', gap:8, alignItems:'center', margin:'6px 0'}}>
        <span className="help-badge" data-testid="search-help" title="Debounced αναζήτηση 300ms. Το Enter κάνει άμεσο replace & μηδενίζει τη σελίδα.">i</span>
        <button type="button" data-testid="density-toggle"
          onClick={()=>{
            setDensity(d=>{ const nx = d==='compact' ? 'normal' : 'compact';
              try { if (typeof window!=='undefined') window.localStorage.setItem('orders:ui:density', nx); } catch {}
              return nx; });
          }}
          style={{fontSize:12, padding:'4px 8px', border:'1px solid #e5e5e5', borderRadius:6, cursor:'pointer'}}
        >
          {density==='compact' ? 'Κανονική προβολή' : 'Συμπαγής πίνακας'}
        </button>
      </div>

      {/* AG99 Facet skeleton */}
      {isFacetLoading && (
        <div data-testid="facet-skeleton" style={{display:'flex', gap:8, flexWrap:'wrap', margin:'8px 0 4px 0', padding:'6px 0'}}>
          {[1,2,3].map(i=> <div key={i} style={{height:24, width:80, borderRadius:999, background:'linear-gradient(90deg,#eee,#f5f5f5,#eee)', backgroundSize:'200% 100%', animation:'ag99-shimmer 1.2s linear infinite'}} />)}
        </div>
      )}

      {/* Facet totals (ALL filtered results) */}
      <div className="help-row" style={{margin:'4px 0'}}>
        <span className="help-badge" data-testid="facet-chips-help" title="Κάνε κλικ ή Enter σε ένα chip για να φιλτράρεις. Κλικ ξανά για καθαρισμό.">?</span>
        <span>Συμβουλή: τα chips ενεργοποιούν/απενεργοποιούν γρήγορα τα φίλτρα κατάστασης.</span>
      </div>
      {!isFacetLoading && facetTotals && facetTotalAll !== null && (
        <div data-testid="facet-totals" style={{display:'flex', gap:8, flexWrap:'wrap', margin:'8px 0 4px 0', position:'sticky', top:0, zIndex:20, background:'#fff', padding:'6px 0', borderBottom:'1px solid #eee'}}
          /* AG98 chips keyboard */
          onKeyDown={(e)=>{ const t=(e.target as HTMLElement).closest('[data-st]') as HTMLElement|null; if(!t) return;
            if(e.key==='Enter'||e.key===' '){ e.preventDefault(); const st=t.getAttribute('data-st'); if(!st) return;
              if((filters.status||'')===st){ clearFilter('status'); } else { setFilter('status', st); } }}}
          onClick={(e)=>{ const t=(e.target as HTMLElement); const clear=t.closest("[data-clear]") as HTMLElement|null; const chip=t.closest("[data-st]") as HTMLElement|null; if(clear){ clearFilter("status"); return; } if(!chip) return; const st=chip.getAttribute("data-st"); if(!st) return; if((filters.status||"")===st){ clearFilter("status"); } else { setFilter("status", st); } }}>
          {Object.entries(facetTotals).sort((a,b)=> b[1]-a[1] || String(a[0]).localeCompare(String(b[0]))).map(([st,count])=>(
            <div key={st} data-st={st} data-testid={`facet-chip-${st}`} title="Κάνε κλικ/Enter για εναλλαγή αυτού του φίλτρου" data-active={(activeStatus===st)?'1':'0'} aria-pressed={activeStatus===st} role='button' tabIndex={0}
          style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 8px', outline:'none', border:'1px solid', borderColor:(activeStatus===st)?'#10b981':'#e5e5e5', background:(activeStatus===st)?'#ecfdf5':'#fff', borderRadius:999, cursor:'pointer', userSelect:'none'}}>
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

      <div role="table" data-testid="density-wrap" data-density={density} style={{display:'grid', gap:(density==='compact'?4:8)}}>
        {/* AG94 density styles */}
        <style>{`
          [data-density="compact"] [role="row"] { font-size: 12px; }
          [data-density="normal"] [role="row"] { font-size: 14px; }
        `}</style>
        <style>{`/* AG98 focus ring */
          [data-st][role='button']:focus{ box-shadow: 0 0 0 3px rgba(16,185,129,0.35); }
        `}</style>
        <style>{`/* AG99 shimmer */
          @keyframes ag99-shimmer{ 0%{background-position:0 0} 100%{background-position:-200% 0} }
        `}</style>
        <style>{`/* AG100 empty-state styles */
          .empty-wrap{border:1px dashed #e5e5e5;border-radius:12px;padding:18px;display:flex;gap:12px;align-items:flex-start;background:#fafafa}
          .empty-title{font-weight:600;margin:0 0 6px 0}
          .empty-desc{margin:0 0 12px 0;color:#666}
          .empty-btn{border:1px solid #e5e5e5;border-radius:8px;padding:6px 10px;cursor:pointer;background:#fff}
          .empty-btn:hover{border-color:#dcdcdc}
        `}</style>
        <style>{`/* AG101 filters helper styles */
          .filters-helper{font-size:12px;color:#6b7280;display:flex;gap:8px;align-items:center;margin:4px 0 8px}
          .filters-helper strong{color:#374151}
          .filters-helper .pill{border:1px solid #e5e7eb;border-radius:999px;padding:2px 8px;background:#fff}
          .filters-helper .clear{border:1px solid #e5e7eb;border-radius:6px;padding:3px 8px;background:#fff;cursor:pointer}
          .filters-helper .clear:hover{border-color:#d1d5db}
        `}</style>
        <style>{`/* AG102 help styles */
          .help-badge{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:999px;border:1px solid #e5e7eb;font-size:10px;line-height:1;background:#fff;color:#6b7280;cursor:help}
          .help-row{display:flex;align-items:center;gap:6px;color:#6b7280;font-size:12px}
        `}</style>

        {/* AG100 — Empty State (zero results) */}
        {(!isFacetLoading && facetTotalAll === 0) && (
          <div data-testid="orders-empty-state" className="empty-wrap" role="status" aria-live="polite">
            <div style={{fontSize:22}}>🗂️</div>
            <div>
              <p className="empty-title">Δεν βρέθηκαν αποτελέσματα</p>
              <p className="empty-desc">Κανένα αποτέλεσμα για τα τρέχοντα φίλτρα. Μπορείς να αλλάξεις τα κριτήρια ή να τα καθαρίσεις.</p>
              <button type="button" className="empty-btn" data-testid="orders-empty-clear"
                onClick={()=>{ clearAll?.({ replace:true }); }}>
                Καθαρισμός φίλτρων
              </button>
            </div>
          </div>
        )}

        {/* AG101 — Filters helper */}
        {(() => {
          const parts: string[] = [];
          if (filters.status) parts.push(`Κατάσταση: ${filters.status}`);
          if (filters.q) parts.push(`Αναζήτηση: "${filters.q}"`);
          if (filters.fromDate || filters.toDate) {
            const a = filters.fromDate || '—';
            const b = filters.toDate || '—';
            parts.push(`Ημ/νίες: ${a} → ${b}`);
          }
          if (filters.sort) parts.push(`Ταξινόμηση: ${filters.sort}`);
          const hasAny = parts.length > 0;
          return hasAny ? (
            <div data-testid="filters-helper" className="filters-helper" aria-live="polite">
              <strong>Ενεργά φίλτρα:</strong>
              {parts.map((t, i) => <span className="pill" key={i}>{t}</span>)}
              <button type="button" className="clear" data-testid="filters-clear-all"
                onClick={()=> clearAll?.({ replace:true })}>Καθαρισμός</button>
            </div>
          ) : null;
        })()}

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
