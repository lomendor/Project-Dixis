'use client';
import React from 'react';

type Status = 'pending'|'paid'|'shipped'|'cancelled'|'refunded'|'unknown';

const MAP: Record<Status, {bg:string; fg:string; label:string}> = {
  pending:  { bg:'#FFF8E1', fg:'#8A6D3B', label:'Σε αναμονή' },
  paid:     { bg:'#E8F5E9', fg:'#256029', label:'Πληρωμή' },
  shipped:  { bg:'#E3F2FD', fg:'#1E5AA7', label:'Απεστάλη' },
  cancelled:{ bg:'#FDECEA', fg:'#B71C1C', label:'Ακυρώθηκε' },
  refunded: { bg:'#F3E5F5', fg:'#6A1B9A', label:'Επιστροφή' },
  unknown:  { bg:'#F5F5F5', fg:'#444',    label:'Άγνωστο' },
};

export default function StatusChip({ status }: { status?: string }) {
  const key = (status?.toLowerCase() as Status) || 'unknown';
  const conf = MAP[key] ?? MAP['unknown'];
  return (
    <span
      role="status"
      aria-label={`Κατάσταση: ${conf.label}`}
      data-testid={`status-${key}`}
      data-status={key}
      style={{
        display:'inline-block',
        padding:'2px 8px',
        borderRadius:999,
        fontSize:12,
        fontWeight:600,
        background: conf.bg,
        color: conf.fg,
        border:'1px solid rgba(0,0,0,0.06)',
      }}
    >
      {conf.label}
    </span>
  );
}
