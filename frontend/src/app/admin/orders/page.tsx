'use client';
import EmptyState from '@/components/EmptyState';
import StatusChip from '@/components/StatusChip';
import FilterChips from '@/components/FilterChips';
import React from 'react';
import Link from 'next/link';
import ToastSuccess from '@/components/ToastSuccess';
import { orderNumber } from '../../../lib/orderNumber';
import DemoOrdersView from '@/app/admin/orders/_components/DemoOrdersView';

type Row = {
  id: string;
  createdAt: string;
  postalCode: string;
  method: string;
  total: number;
  paymentStatus?: string;
  email?: string;
};

export default function AdminOrders() {
  // AG73.1 — demo routing without conditional hooks
  if (typeof window !== 'undefined') {
    const search = new URLSearchParams(window.location.search);
    const isDemo = search.get('statusFilterDemo') === '1';
    if (isDemo) {
      return <DemoOrdersView />;
    }
  }

  // AG61/AG67 demos (no hooks here, safe)
  if (typeof window !== 'undefined') {
    const search = new URLSearchParams(window.location.search);

    const isEmptyDemo = search.get('empty') === '1';
    if (isEmptyDemo) {
      return (
        <main style={{padding:16}}>
          <EmptyState />
        </main>
      );
    }

    const isStatusDemo = search.get('statusDemo') === '1';
    if (isStatusDemo) {
      const demo = [
        { id: 'A-1001', customer: 'Μαρία', total: '€42.00', status: 'pending' },
        { id: 'A-1002', customer: 'Γιάννης', total: '€99.90', status: 'paid' },
        { id: 'A-1003', customer: 'Κατερίνα', total: '€19.50', status: 'shipped' },
        { id: 'A-1004', customer: 'Νίκος', total: '€59.00', status: 'cancelled' },
        { id: 'A-1005', customer: 'Ελένη', total: '€12.00', status: 'refunded' },
      ];
      return (
        <main style={{padding:16}}>
          <h2 style={{margin:'0 0 12px 0'}}>Παραγγελίες (demo statuses)</h2>
          <div role="table" style={{display:'grid', gap:8}}>
            <div role="row" style={{display:'grid', gridTemplateColumns:'1.2fr 2fr 1fr 1.2fr', gap:12, fontWeight:600, fontSize:12, color:'#555'}}>
              <div>Order</div><div>Πελάτης</div><div>Σύνολο</div><div>Κατάσταση</div>
            </div>
            {demo.map(o=>(
              <div key={o.id} role="row" style={{display:'grid', gridTemplateColumns:'1.2fr 2fr 1fr 1.2fr', gap:12, alignItems:'center', padding:'8px 0', borderTop:'1px solid #eee'}}>
                <div>{o.id}</div>
                <div>{o.customer}</div>
                <div>{o.total}</div>
                <div><StatusChip status={o.status} /></div>
              </div>
            ))}
          </div>
        </main>
      );
    }
  }

  const [rows, setRows] = React.useState<Row[]>([]);
  const [err, setErr] = React.useState<string>('');
  const hydratedRef = React.useRef(false); // AG33: one-time hydration guard

  // Filter state
  const [q, setQ] = React.useState('');
  const [pc, setPc] = React.useState('');
  const [method, setMethod] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [ordNo, setOrdNo] = React.useState('');
  const ordNoRef = React.useRef<HTMLInputElement | null>(null); // AG36: ref for keyboard focus
  const [fromISO, setFromISO] = React.useState<string>('');
  const [toISO, setToISO] = React.useState<string>('');

  // Helper functions for quick date filters
  const iso = (d: Date) => d.toISOString();
  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const addDays = (d: Date, n: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  const setQuickRange = (days: number) => {
    const now = new Date();
    const from = days === 0 ? startOfDay(now) : addDays(now, -days);
    const to = addDays(startOfDay(now), 1); // exclusive end (tomorrow 00:00)
    setFromISO(iso(from));
    setToISO(iso(to));
  };

  // Pagination state (AG36.1: 1-based)
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [resetMsg, setResetMsg] = React.useState(''); // AG41: reset toast flag

  // Summary state
  const [sumAmount, setSumAmount] = React.useState(0);
  const [sumErr, setSumErr] = React.useState('');

  // Sorting state
  const [sortKey, setSortKey] = React.useState<'createdAt' | 'total'>('createdAt');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');

  // AG37: Download filename state
  const [downloadName, setDownloadName] = React.useState('orders.csv');

  // AG57: Unified toast state
  const [toast, setToast] = React.useState<{show:boolean,text:string}>({show:false,text:''});
  const showToast = (msg:string='Εφαρμόστηκε') => {
    setToast({show:true,text:msg});
    setTimeout(()=>setToast({show:false,text:''}), 1200);
  };

  // AG33: Parse query string from current browser location
  function parseQSFromLocation() {
    if (typeof window === 'undefined') return new URLSearchParams('');
    return new URLSearchParams(window.location.search || '');
  }

  // AG41: Reset all filters to defaults
  function onResetFilters() {
    try {
      // Clear localStorage
      localStorage.removeItem('dixis.adminOrders.filters');
    } catch {}

    try {
      // Reset all filter state to defaults
      setQ('');
      setPc('');
      setMethod('');
      setStatus('');
      setOrdNo('');
      setFromISO('');
      setToISO('');
      setSortKey('createdAt');
      setSortDir('desc');
      setPage(1);
      // Note: pageSize is preserved (admin's choice)

      // Clear URL
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/admin/orders');
      }

      // Show success toast
      setResetMsg('Επαναφέρθηκαν');
      setTimeout(() => setResetMsg(''), 1200);
    } catch {}
  }

  // Helper to build filter params (no pagination)
  const buildFilterParams = React.useCallback(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (pc) params.set('pc', pc);
    if (method) params.set('method', method);
    if (status) params.set('status', status);
    if (ordNo) params.set('ordNo', ordNo);
    if (fromISO) params.set('from', fromISO);
    if (toISO) params.set('to', toISO);
    return params;
  }, [q, pc, method, status, ordNo, fromISO, toISO]);

  const fetchOrders = React.useCallback(async () => {
    try {
      // Build query string
      const params = buildFilterParams();

      // Pagination params (AG36.1: convert 1-based page to 0-based skip)
      const skip = (page - 1) * pageSize;
      params.set('skip', String(skip));
      params.set('take', String(pageSize));
      params.set('count', '1');

      // Sorting params
      params.set('sort', sortKey);
      params.set('dir', sortDir);

      const query = params.toString();
      const url = query ? `/api/admin/orders?${query}` : '/api/admin/orders';

      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();

      // Handle both formats: array (old) or {items, total} (new with count=1)
      if (Array.isArray(j)) {
        setRows(j);
        setTotal(j.length);
      } else if (j.items && typeof j.total === 'number') {
        setRows(j.items);
        setTotal(j.total);
      } else {
        setRows([]);
        setTotal(0);
      }
      setErr('');
    } catch (e: any) {
      setErr('Δεν είναι διαθέσιμο (ίσως BASIC_AUTH=1 μόνο σε CI).');
    }
  }, [buildFilterParams, page, pageSize, sortKey, sortDir]);

  // AG33: Hydrate filters from URL (priority) or localStorage on first load
  React.useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    try {
      const sp = parseQSFromLocation();
      const hasQS = Array.from(sp.keys()).length > 0;
      let saved: any = null;

      // Try to load from localStorage
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('dixis.adminOrders.filters');
          saved = stored ? JSON.parse(stored) : null;
        }
      } catch {}

      // Helper: pick from URL (priority) or localStorage fallback
      const pick = (key: string, def: any) => {
        if (hasQS && sp.has(key)) {
          return sp.get(key) ?? def;
        }
        return (saved && saved[key] !== undefined) ? saved[key] : def;
      };

      // Restore filter state
      setQ(String(pick('q', '') || ''));
      setPc(String(pick('pc', '') || ''));
      setMethod(String(pick('method', '') || ''));
      setStatus(String(pick('status', '') || ''));
      setOrdNo(String(pick('ordNo', '') || ''));
      setFromISO(String(pick('from', '') || ''));
      setToISO(String(pick('to', '') || ''));
      setSortKey(pick('sort', 'createdAt') as 'createdAt' | 'total');
      setSortDir(pick('dir', 'desc') as 'asc' | 'desc');

      // Restore pagination
      const ps = parseInt(String(pick('take', '') || String((saved && saved.pageSize) || ''))) || 0;
      if (ps) setPageSize(ps);

      const p = parseInt(String(pick('page', '') || '')) || 0;
      if (p > 0) setPage(p);
    } catch {}
  }, []);

  // AG57: Toast on chip clicks
  React.useEffect(() => {
    const host = document.querySelector('[data-testid="chips-toolbar"]');
    if (!host) return undefined;

    const sel = '[data-testid^="chip-status-"],[data-testid^="chip-method-"],[data-testid="chip-clear"]';
    const handler = (ev: Event) => {
      const el = ev.target as HTMLElement | null;
      if (!el) return;
      const isChip = el.closest(sel);
      if (isChip) showToast('Εφαρμόστηκε');
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  // AG36: Keyboard shortcuts
  React.useEffect(() => {
    function isTypingTarget(el: any) {
      return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    }

    function onKey(e: KeyboardEvent) {
      const tgt = e.target as any;

      // '/' → focus Order No (unless already typing in an input)
      if (e.key === '/' && !isTypingTarget(tgt)) {
        e.preventDefault();
        ordNoRef?.current?.focus();
        return;
      }

      // 't' → Today range (unless typing in input)
      if ((e.key === 't' || e.key === 'T') && !isTypingTarget(tgt)) {
        e.preventDefault();
        try {
          setQuickRange(0);
          setPage(1); // AG36.1: reset to page 1
        } catch {}
        return;
      }

      // '[' → prev page
      if (e.key === '[' && !isTypingTarget(tgt)) {
        e.preventDefault();
        try {
          setPage((p: number) => Math.max(1, p - 1)); // AG36.1: min page is 1
        } catch {}
        return;
      }

      // ']' → next page
      if (e.key === ']' && !isTypingTarget(tgt)) {
        e.preventDefault();
        try {
          setPage((p: number) => p + 1);
        } catch {}
        return;
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPage, setQuickRange]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Fetch summary (independent of pagination)
  React.useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = buildFilterParams();
        const query = params.toString();
        const url = query ? `/api/admin/orders/summary?${query}` : '/api/admin/orders/summary';

        const r = await fetch(url, { cache: 'no-store' });
        if (!r.ok) {
          setSumErr('⚠️');
          return;
        }
        const j = await r.json();
        setSumAmount(Number(j.totalAmount ?? 0));
        setSumErr('');
      } catch {
        setSumErr('⚠️');
      }
    };
    fetchSummary();
  }, [buildFilterParams]);

  // AG37: Calculate download filename based on filters (mirrors server logic)
  React.useEffect(() => {
    try {
      const safePart = (x: string) =>
        String(x || '')
          .toLowerCase()
          .replace(/[^a-z0-9._-]+/g, '-')
          .slice(0, 60);

      const parts: string[] = ['orders'];
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      // Date range or ordNo suffix
      if (ordNo && ordNo.includes('-')) {
        const suffix = ordNo.split('-').pop()?.toLowerCase() || '';
        if (suffix) {
          parts.push(today, `ord-${suffix}`);
        } else {
          parts.push(today);
        }
      } else if (fromISO || toISO) {
        const fromPart = fromISO ? safePart(fromISO.slice(0, 10)) : '';
        const toPart = toISO ? safePart(toISO.slice(0, 10)) : '';
        if (fromPart && toPart && fromPart === toPart) {
          parts.push(fromPart);
        } else {
          if (fromPart) parts.push(`from-${fromPart}`);
          if (toPart) parts.push(`to-${toPart}`);
        }
      } else {
        parts.push(today);
      }

      // Other filters
      if (method) parts.push(safePart(method));
      if (status) parts.push(safePart(status));
      if (q) parts.push(`q-${safePart(q)}`);
      if (pc) parts.push(`pc-${safePart(pc)}`);

      const filename = parts.join('_') + '.csv';
      setDownloadName(filename);
    } catch {
      setDownloadName('orders.csv');
    }
  }, [ordNo, fromISO, toISO, method, status, q, pc]);

  // AG33: Sync filters to URL and localStorage on change
  React.useEffect(() => {
    try {
      if (typeof window === 'undefined') return;

      // Build query string with all filters
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (pc) params.set('pc', pc);
      if (method) params.set('method', method);
      if (status) params.set('status', status);
      if (ordNo) params.set('ordNo', ordNo);
      if (fromISO) params.set('from', fromISO);
      if (toISO) params.set('to', toISO);
      params.set('sort', sortKey);
      params.set('dir', sortDir);
      params.set('take', String(pageSize));
      params.set('page', String(page));

      const base = '/admin/orders';
      const qs = params.toString();
      const url = qs ? `${base}?${qs}` : base;

      // Update URL without page reload
      window.history.replaceState(null, '', url);

      // Save to localStorage
      const payload = {
        q,
        pc,
        method,
        status,
        ordNo,
        from: fromISO,
        to: toISO,
        sort: sortKey,
        dir: sortDir,
        pageSize,
        page,
      };
      localStorage.setItem('dixis.adminOrders.filters', JSON.stringify(payload));
    } catch {}
  }, [q, pc, method, status, ordNo, fromISO, toISO, sortKey, sortDir, pageSize, page]);

  /* AG45-columns */
  React.useEffect(() => {
    const KEY = 'dixis.adminOrders.columns';
    const scroll = document.querySelector('[data-testid="orders-scroll"]');
    const table = scroll?.querySelector('table') || document.querySelector('table');
    if (!table) return () => {};

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody') || table;
    if (!thead || !tbody) return () => {};

    // Extract current header keys
    function headerKeys() {
      const ths = Array.from(thead.querySelectorAll('th'));
      return ths.map((th, i) => {
        const k = (th.textContent || `col${i}`).trim().toLowerCase().replace(/\s+/g,' ');
        return { i, key: k || `col${i}` };
      });
    }

    // Load/Save visibility map
    function loadMap(keys: {i:number, key:string}[]) {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return Object.fromEntries(keys.map(k => [k.key, true]));
        const parsed = JSON.parse(raw);
        const map = Object.fromEntries(keys.map(k => [k.key, parsed[k.key] !== false]));
        return map;
      } catch { return Object.fromEntries(keys.map(k => [k.key, true])); }
    }
    function saveMap(map: any) {
      try { localStorage.setItem(KEY, JSON.stringify(map)); } catch {}
    }

    // Apply visibility to th/td
    function apply(map: any, keys: {i:number, key:string}[]){
      const ths = Array.from(thead!.querySelectorAll('th'));
      keys.forEach(({i, key}) => {
        const vis = map[key] !== false;
        const disp = vis ? '' : 'none';
        if (ths[i]) (ths[i] as HTMLElement).style.display = disp;
      });
      const rows = Array.from(tbody!.querySelectorAll('tr'));
      rows.forEach(tr => {
        const tds = Array.from(tr.querySelectorAll('td'));
        keys.forEach(({i, key}) => {
          const vis = map[key] !== false;
          const disp = vis ? '' : 'none';
          if (tds[i]) (tds[i] as HTMLElement).style.display = disp;
        });
      });
    }

    // Build/attach toolbar UI
    const keys = headerKeys();
    let map = loadMap(keys);

    // Find toolbar host (reuse filters-toolbar if exists)
    let host = document.querySelector('[data-testid="filters-toolbar"]') as HTMLElement | null;
    const scrollDiv = document.querySelector('[data-testid="orders-scroll"]');
    if (!host) {
      host = document.createElement('div');
      host.className = 'mb-2 flex items-center gap-3';
      host.setAttribute('data-testid','filters-toolbar');
      if (scrollDiv && scrollDiv.parentElement) {
        scrollDiv.parentElement.insertBefore(host, scrollDiv);
      } else {
        table.parentElement?.insertBefore(host, table);
      }
    }

    // Columns sub-toolbar
    let bar = document.querySelector('[data-testid="columns-toolbar"]') as HTMLElement | null;
    if (!bar) {
      bar = document.createElement('div');
      bar.setAttribute('data-testid','columns-toolbar');
      bar.className = 'flex items-center gap-3 flex-wrap';
      const label = document.createElement('span');
      label.textContent = 'Columns:';
      label.className = 'text-xs text-neutral-600';
      bar.appendChild(label);

      keys.forEach(({i, key}) => {
        const pretty = key.charAt(0).toUpperCase() + key.slice(1);
        const wrap = document.createElement('label');
        wrap.className = 'text-xs flex items-center gap-1 border rounded px-2 py-1';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = map[key] !== false;
        cb.setAttribute('data-testid', `col-toggle-${i}`);
        cb.addEventListener('change', () => {
          map[key] = cb.checked;
          saveMap(map);
          apply(map, keys);
        });
        const txt = document.createElement('span');
        txt.textContent = pretty;
        wrap.appendChild(cb); wrap.appendChild(txt);
        bar!.appendChild(wrap);
      });

      host.appendChild(bar);
    }

    // First apply
    apply(map, keys);

    // Observe changes and re-apply (paging, filtering, etc.)
    const mo = new MutationObserver(() => {
      const newKeys = headerKeys();
      // If headers changed, extend map and rebuild UI silently
      if (newKeys.length !== keys.length || newKeys.some((k,idx)=>k.key!==keys[idx].key)) {
        // merge defaults
        newKeys.forEach(k => { if (!(k.key in map)) map[k.key] = true; });
        saveMap(map);
        // Rebuild checkboxes
        const old = bar!.querySelectorAll('label');
        old.forEach(el => el.remove());
        newKeys.forEach(({i, key}) => {
          const pretty = key.charAt(0).toUpperCase() + key.slice(1);
          const wrap = document.createElement('label');
          wrap.className = 'text-xs flex items-center gap-1 border rounded px-2 py-1';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = map[key] !== false;
          cb.setAttribute('data-testid', `col-toggle-${i}`);
          cb.addEventListener('change', () => {
            map[key] = cb.checked;
            saveMap(map);
            apply(map, newKeys);
          });
          const txt = document.createElement('span');
          txt.textContent = pretty;
          wrap.appendChild(cb); wrap.appendChild(txt);
          bar!.appendChild(wrap);
        });
        (keys as any).length = 0; newKeys.forEach(k=>keys.push(k));
      }
      apply(map, keys);
    });
    mo.observe(tbody, { childList: true, subtree: true });
    mo.observe(thead, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, []);

  /* AG47-presets */
  React.useEffect(() => {
    const toolbar = document.querySelector('[data-testid="columns-toolbar"]') as HTMLElement | null;
    if (!toolbar) return () => {};

    // Helper to dispatch change event
    function dispatchChange(cb: HTMLInputElement) {
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Helper to get all column toggles
    function toggles() {
      return Array.from(document.querySelectorAll('[data-testid="columns-toolbar"] input[type=checkbox]')) as HTMLInputElement[];
    }

    // Helper to create preset button
    function mkBtn(testId: string, label: string, title: string) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-testid', testId);
      btn.textContent = label;
      btn.title = title;
      btn.className = 'border px-2 py-1 rounded text-xs hover:bg-gray-100';
      return btn;
    }

    // Create presets container if not exists
    let presets = document.querySelector('[data-testid="columns-presets"]') as HTMLElement | null;
    if (!presets) {
      presets = document.createElement('div');
      presets.setAttribute('data-testid', 'columns-presets');
      presets.className = 'flex items-center gap-2 flex-wrap';

      const label = document.createElement('span');
      label.textContent = 'Presets:';
      label.className = 'text-xs text-neutral-600';
      presets.appendChild(label);

      // Create 3 preset buttons
      const btnAll = mkBtn('preset-all', 'All', 'Show all columns');
      const btnMin = mkBtn('preset-minimal', 'Minimal', 'Keep first 3 columns');
      const btnFin = mkBtn('preset-finance', 'Finance', 'Totals/Shipping/Amount-focused');

      presets.appendChild(btnAll);
      presets.appendChild(btnMin);
      presets.appendChild(btnFin);

      // Insert after columns-toolbar
      toolbar.parentElement?.insertBefore(presets, toolbar.nextSibling);
    }

    // Wire up preset buttons
    const allBtn = document.querySelector('[data-testid="preset-all"]');
    const minBtn = document.querySelector('[data-testid="preset-minimal"]');
    const finBtn = document.querySelector('[data-testid="preset-finance"]');

    // All preset: check all columns
    const onAll = () => {
      toggles().forEach(cb => {
        if (!cb.checked) {
          cb.checked = true;
          dispatchChange(cb);
        }
      });
    };

    // Minimal preset: first 3 columns only
    const onMin = () => {
      toggles().forEach((cb, idx) => {
        const want = idx < 3;
        if (cb.checked !== want) {
          cb.checked = want;
          dispatchChange(cb);
        }
      });
    };

    // Finance preset: first column + financial columns (regex match)
    const onFin = () => {
      toggles().forEach((cb, idx) => {
        const label = (cb.parentElement?.textContent || '').toLowerCase();
        const isFinance = /total|subtotal|σύνολο|υποσύνολο|shipping|μεταφορ|tax|φόρ|amount|ποσό/.test(label);
        const want = idx === 0 || isFinance;
        if (cb.checked !== want) {
          cb.checked = want;
          dispatchChange(cb);
        }
      });
    };

    allBtn?.addEventListener('click', onAll);
    minBtn?.addEventListener('click', onMin);
    finBtn?.addEventListener('click', onFin);

    return () => {
      allBtn?.removeEventListener('click', onAll);
      minBtn?.removeEventListener('click', onMin);
      finBtn?.removeEventListener('click', onFin);
    };
  }, []);

  /* AG50-filter-chips */
  React.useEffect(() => {
    // Helper to update URL params
    function setParam(key: string, val: string) {
      if (typeof window === 'undefined') return;
      const sp = new URLSearchParams(window.location.search);
      if (val) sp.set(key, val);
      else sp.delete(key);
      const qs = sp.toString();
      const url = qs ? `/admin/orders?${qs}` : '/admin/orders';
      window.history.replaceState(null, '', url);
    }

    // Helper to get current URL param
    function getParam(key: string): string {
      if (typeof window === 'undefined') return '';
      const sp = new URLSearchParams(window.location.search);
      return sp.get(key) || '';
    }

    // Helper to create chip button
    function mkChip(testId: string, label: string, filterKey: string, filterVal: string) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-testid', testId);
      btn.textContent = label;
      btn.className = 'border px-2 py-1 rounded text-xs hover:bg-gray-200';

      // Check if active
      const currentVal = getParam(filterKey);
      if (currentVal === filterVal) {
        btn.style.backgroundColor = '#000';
        btn.style.color = '#fff';
      }

      btn.addEventListener('click', () => {
        const current = getParam(filterKey);
        if (current === filterVal) {
          // Deactivate
          setParam(filterKey, '');
          if (filterKey === 'status') setStatus('');
          if (filterKey === 'method') setMethod('');
        } else {
          // Activate
          setParam(filterKey, filterVal);
          if (filterKey === 'status') setStatus(filterVal);
          if (filterKey === 'method') setMethod(filterVal);
        }
        setPage(1); // Reset to page 1 on filter change
      });

      return btn;
    }

    // Find or create chips toolbar
    let toolbar = document.querySelector('[data-testid="chips-toolbar"]') as HTMLElement | null;
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.setAttribute('data-testid', 'chips-toolbar');
      toolbar.className = 'mt-3 mb-2 flex items-center gap-2 flex-wrap';

      const label = document.createElement('span');
      label.textContent = 'Quick Filters:';
      label.className = 'text-xs text-neutral-600';
      toolbar.appendChild(label);

      // Status chips
      const statusLabel = document.createElement('span');
      statusLabel.textContent = 'Status:';
      statusLabel.className = 'text-xs text-neutral-500 ml-2';
      toolbar.appendChild(statusLabel);
      toolbar.appendChild(mkChip('chip-status-paid', 'PAID', 'status', 'PAID'));
      toolbar.appendChild(mkChip('chip-status-pending', 'PENDING', 'status', 'PENDING'));
      toolbar.appendChild(mkChip('chip-status-canceled', 'CANCELED', 'status', 'CANCELED'));

      // Method chips
      const methodLabel = document.createElement('span');
      methodLabel.textContent = 'Method:';
      methodLabel.className = 'text-xs text-neutral-500 ml-2';
      toolbar.appendChild(methodLabel);
      toolbar.appendChild(mkChip('chip-method-courier', 'COURIER', 'method', 'COURIER'));
      toolbar.appendChild(mkChip('chip-method-pickup', 'PICKUP', 'method', 'PICKUP'));

      // Clear-all button
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.setAttribute('data-testid', 'chip-clear');
      clearBtn.textContent = 'Clear all';
      clearBtn.className = 'border px-2 py-1 rounded text-xs hover:bg-gray-200 ml-2';
      clearBtn.addEventListener('click', () => {
        setParam('status', '');
        setParam('method', '');
        setStatus('');
        setMethod('');
        setPage(1);
      });
      toolbar.appendChild(clearBtn);

      // Insert before orders-scroll
      const scrollDiv = document.querySelector('[data-testid="orders-scroll"]');
      if (scrollDiv && scrollDiv.parentElement) {
        scrollDiv.parentElement.insertBefore(toolbar, scrollDiv);
      }
    }

    // Sync visual state with URL changes (popstate)
    function syncVisual() {
      const chips = toolbar!.querySelectorAll('button[data-testid^="chip-"]');
      chips.forEach((chip) => {
        const btn = chip as HTMLButtonElement;
        const testId = btn.getAttribute('data-testid') || '';

        // Determine filter key and value from testId
        let filterKey = '';
        let filterVal = '';
        if (testId.startsWith('chip-status-')) {
          filterKey = 'status';
          filterVal = testId.replace('chip-status-', '').toUpperCase();
        } else if (testId.startsWith('chip-method-')) {
          filterKey = 'method';
          filterVal = testId.replace('chip-method-', '').toUpperCase();
        }

        if (filterKey && filterVal) {
          const currentVal = getParam(filterKey);
          if (currentVal === filterVal) {
            btn.style.backgroundColor = '#000';
            btn.style.color = '#fff';
          } else {
            btn.style.backgroundColor = '';
            btn.style.color = '';
          }
        }
      });
    }

    window.addEventListener('popstate', syncVisual);
    return () => window.removeEventListener('popstate', syncVisual);
  }, [setStatus, setMethod, setPage]);

  /* AG57: remove AG53 DOM injection */

  /* AG43-row-actions */
  React.useEffect(() => {
    const table = document.querySelector('[data-testid="orders-scroll"] table') || document.querySelector('table');
    if (!table) return undefined;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    function enhanceRow(tr: HTMLTableRowElement): void {
      if ((tr as any).__dixis_actions) return;
      const text = tr.innerText || '';
      const m = text.match(/DX-\d{8}-\d{4}/);
      const ordNo = m ? m[0] : null;
      if (!ordNo) return;

      // Βρες κελί για να μπει το block (τελευταίο κελί)
      const tds = tr.querySelectorAll('td');
      if (!tds.length) return;
      const host = tds[tds.length - 1];

      // Αν υπάρχει ήδη, μην ξαναβάλεις
      if (host.querySelector('[data-testid="row-actions"]')) return;

      const wrap = document.createElement('div');
      wrap.setAttribute('data-testid', 'row-actions');
      wrap.style.display = 'flex';
      wrap.style.gap = '6px';
      wrap.style.alignItems = 'center';
      wrap.style.flexWrap = 'wrap';

      const btn1 = document.createElement('button');
      btn1.type = 'button';
      btn1.setAttribute('data-testid', 'row-copy-ordno');
      btn1.textContent = 'Copy ordNo';
      btn1.className = 'border px-2 py-1 rounded text-xs';

      const btn2 = document.createElement('button');
      btn2.type = 'button';
      btn2.setAttribute('data-testid', 'row-copy-link');
      btn2.textContent = 'Copy link';
      btn2.className = 'border px-2 py-1 rounded text-xs';

      const toast = document.createElement('span');
      toast.setAttribute('data-testid', 'row-copy-toast');
      toast.textContent = 'Αντιγράφηκε';
      toast.className = 'text-xs text-green-700';
      toast.style.display = 'none';

      function showToast() {
        toast.style.display = '';
        setTimeout(() => { toast.style.display = 'none'; }, 1200);
      }

      btn1.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(ordNo!); } catch { }
        showToast();
      });

      btn2.addEventListener('click', async () => {
        const url = origin ? `${origin}/orders/lookup?ordNo=${encodeURIComponent(ordNo!)}` : ordNo!;
        try { await navigator.clipboard.writeText(url); } catch { }
        showToast();
      });

      wrap.appendChild(btn1);
      wrap.appendChild(btn2);
      wrap.appendChild(toast);

      // Βάλε ένα separator αν το κελί έχει ήδη περιεχόμενο
      if (host.childNodes.length) {
        const sep = document.createElement('div');
        sep.style.height = '4px';
        host.appendChild(sep);
      }
      host.appendChild(wrap);
      (tr as any).__dixis_actions = true;
    }

    const tbody = table.querySelector('tbody') || table;
    Array.from(tbody.querySelectorAll('tr')).forEach(enhanceRow);

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLTableRowElement) enhanceRow(n);
          if (n instanceof HTMLElement) n.querySelectorAll && n.querySelectorAll('tr').forEach((tr) => enhanceRow(tr as HTMLTableRowElement));
        });
      }
    });
    mo.observe(tbody, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, []);

  const buildExportUrl = () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (pc) params.set('pc', pc);
    if (method) params.set('method', method);
    if (status) params.set('status', status);
    if (ordNo) params.set('ordNo', ordNo);
    if (fromISO) params.set('from', fromISO);
    if (toISO) params.set('to', toISO);
    params.set('sort', sortKey); // AG33: include sort
    params.set('dir', sortDir); // AG33: include dir
    const query = params.toString();
    return query
      ? `/api/admin/orders/export?${query}`
      : '/api/admin/orders/export';
  };

  return (
    <main style={{ maxWidth: 960, margin: '40px auto', padding: 16 }}>
      <h2 style={{ margin: 0 }}>Admin · Orders</h2>
      <p style={{ color: '#6b7280', marginTop: 6 }}>
        Τελευταίες παραγγελίες (CI/DEV).
      </p>
      {err && <div className="mt-2 text-sm text-red-600">{err}</div>}

      {/* Quick Date Filters */}
      <div className="mt-4 mb-2 flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => { setQuickRange(0); setPage(1); }}
          className="border px-2 h-7 rounded hover:bg-gray-100"
          data-testid="quick-range-today"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => { setQuickRange(7); setPage(1); }}
          className="border px-2 h-7 rounded hover:bg-gray-100"
          data-testid="quick-range-7d"
        >
          7d
        </button>
        <button
          type="button"
          onClick={() => { setQuickRange(30); setPage(1); }}
          className="border px-2 h-7 rounded hover:bg-gray-100"
          data-testid="quick-range-30d"
        >
          30d
        </button>
        <button
          type="button"
          onClick={() => {
            setFromISO('');
            setToISO('');
          }}
          className="border px-2 h-7 rounded hover:bg-gray-100"
          data-testid="quick-range-clear"
        >
          Clear Dates
        </button>
      </div>

      {/* Filter Controls */}
      <div
        className="mb-4 p-3 border rounded"
        style={{ backgroundColor: '#f9fafb' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <label className="block mb-1 text-xs font-medium">
              Αναζήτηση (ID ή Email)
            </label>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Αναζήτηση..."
              className="w-full px-2 py-1 border rounded"
              data-testid="filter-q"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium">Τ.Κ.</label>
            <input
              type="text"
              value={pc}
              onChange={(e) => setPc(e.target.value)}
              placeholder="Ταχυδρομικός κώδικας"
              className="w-full px-2 py-1 border rounded"
              data-testid="filter-pc"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium">Μέθοδος</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-2 py-1 border rounded"
              data-testid="filter-method"
            >
              <option value="">Όλες</option>
              <option value="COURIER">COURIER</option>
              <option value="PICKUP">PICKUP</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2 py-1 border rounded"
              data-testid="filter-status"
            >
              <option value="">Όλα</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium">
              Order No (DX-YYYYMMDD-####)
            </label>
            <input
              type="text"
              value={ordNo}
              onChange={(e) => setOrdNo(e.target.value)}
              placeholder="Order No (DX-YYYYMMDD-####)"
              ref={ordNoRef}
              className="w-full px-2 py-1 border rounded"
              data-testid="filter-ordno"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={fetchOrders}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            data-testid="filter-apply"
          >
            Εφαρμογή Φίλτρων
          </button>
          <button
            onClick={() => {
              setQ('');
              setPc('');
              setMethod('');
              setStatus('');
              setOrdNo('');
              setPage(1); // AG36.1: reset to page 1
            }}
            className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
            data-testid="filter-clear"
          >
            Καθαρισμός
          </button>
          <a
            href={buildExportUrl()}
            download={downloadName}
            className="ml-auto px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            data-testid="export-csv"
          >
            Export CSV
          </a>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="mt-2 text-sm text-gray-700" data-testid="orders-summary">
        Σύνοψη: {total.toLocaleString()} παραγγελίες · Σύνολο €{sumAmount.toFixed(2)}
        {sumErr && <span className="text-red-600"> {sumErr}</span>}
      </div>

      {/* AG41: Filters toolbar with Reset button */}
      <div className="mt-3 mb-2 flex items-center gap-3" data-testid="filters-toolbar">
        <button
          type="button"
          className="border px-3 py-2 rounded hover:bg-gray-100"
          data-testid="filters-reset"
          onClick={onResetFilters}
        >
          Reset filters
        </button>
        {resetMsg && (
          <span data-testid="filters-reset-flag" className="text-xs text-green-700">
            {resetMsg}
          </span>
        )}
      </div>

      {/* AG39: Scroll container with sticky header */}
      <div className="overflow-auto max-h-[70vh] border rounded" data-testid="orders-scroll">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="text-left">
              <th className="bg-white border-b">Order #</th>
              <th className="bg-white border-b">ID</th>
              <th className="bg-white border-b">
                <button
                  onClick={() => {
                    if (sortKey === 'createdAt') {
                      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
                    } else {
                      setSortKey('createdAt');
                      setSortDir('desc');
                    }
                    setPage(1); // AG36.1: reset to page 1
                  }}
                  className="underline cursor-pointer"
                  data-testid="th-date"
                >
                  Ημ/νία {sortKey === 'createdAt' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="bg-white border-b">Τ.Κ.</th>
              <th className="bg-white border-b">Μέθοδος</th>
              <th className="bg-white border-b">
                <button
                  onClick={() => {
                    if (sortKey === 'total') {
                      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
                    } else {
                      setSortKey('total');
                      setSortDir('desc');
                    }
                    setPage(1); // AG36.1: reset to page 1
                  }}
                  className="underline cursor-pointer"
                  data-testid="th-total"
                >
                  Σύνολο {sortKey === 'total' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="bg-white border-b">Status</th>
              <th className="bg-white border-b">Email</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="pr-2">
                  {orderNumber(r.id as any, r.createdAt as any)}
                </td>
                <td className="pr-2">
                  <a
                    href={`/admin/orders/${r.id}`}
                    className="underline"
                    data-testid="order-link"
                  >
                    {r.id.slice(0, 8)}
                  </a>
                </td>
                <td className="pr-2">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="pr-2">{r.postalCode}</td>
                <td className="pr-2">{r.method}</td>
                <td className="pr-2" data-testid="cell-total">
                  €{typeof r.total === 'number'
                    ? r.total.toFixed(2)
                    : String(r.total)}
                </td>
                <td>{r.paymentStatus ?? 'PAID'}</td>
                <td className="pr-2">{r.email ?? '-'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="text-neutral-600">
                  Καμία καταχώρηση.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-xs text-neutral-500 mt-3" data-testid="kb-hints">
        Shortcuts: / focus · t Today · [ Prev · ] Next
      </div>

      {/* Pagination Controls */}
      <div className="mt-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium">Page Size:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1); // AG36.1: reset to page 1
            }}
            className="px-2 py-1 border rounded text-xs"
            data-testid="page-size"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className="text-xs text-gray-600" data-testid="page-info">
          {total === 0
            ? 'No orders'
            : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total} orders`}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            data-testid="pager-prev"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * pageSize >= total}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            data-testid="pager-next"
          >
            Next
          </button>
        </div>
      </div>
          <ToastSuccess show={toast.show} text={toast.text} extraTestIds={['chips-toast']} />
</main>
  );
}
