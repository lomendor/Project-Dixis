'use client';
import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  title = 'Δεν βρέθηκαν αποτελέσματα',
  message = 'Δοκίμασε να αλλάξεις ή να καθαρίσεις τα φίλτρα',
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
      aria-live="polite"
      style={{
        padding: 32,
        display: 'grid',
        gap: 12,
        alignItems: 'center',
        justifyItems: 'center',
        textAlign: 'center',
        border: '1px dashed #DDD',
        borderRadius: 8,
      }}
    >
      <div style={{fontSize: 16, fontWeight: 600}}>{title}</div>
      <div style={{fontSize: 12, color: '#666'}}>{message}</div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          style={{
            marginTop: 8,
            padding: '8px 16px',
            backgroundColor: '#22C55E',
            color: 'white',
            borderRadius: 6,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
