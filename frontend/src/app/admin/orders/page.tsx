'use client';
import React from 'react';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import StatusChip from '@/components/StatusChip';
import DemoOrdersView from '@/app/admin/orders/_components/DemoOrdersView';
import AdminOrdersMain from '@/app/admin/orders/_components/AdminOrdersMain';

export default function AdminOrders() {
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isDemo = search?.get('statusFilterDemo') === '1';
  const isEmptyDemo = search?.get('empty') === '1';
  const isStatusDemo = search?.get('statusDemo') === '1';

  if (isDemo) return <DemoOrdersView />;

  if (isEmptyDemo) {
    return (
      <main style={{padding:16}}>
        <EmptyState />
      </main>
    );
  }

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

  // default: κύριο view (με hooks) χωρίς κανένα early return πριν από αυτό
  return <AdminOrdersMain />;
}
