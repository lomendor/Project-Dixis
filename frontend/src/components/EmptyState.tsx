'use client';
import React from 'react';

export default function EmptyState() {
  return (
    <div
      data-testid="empty-state"
      aria-live="polite"
      style={{
        padding: 32,
        display: 'grid',
        gap: 8,
        alignItems: 'center',
        justifyItems: 'center',
        textAlign: 'center',
        border: '1px dashed #DDD',
        borderRadius: 8,
      }}
    >
      <div style={{fontSize: 16, fontWeight: 600}}>Δεν βρέθηκαν αποτελέσματα</div>
      <div style={{fontSize: 12, color: '#666'}}>Δοκίμασε να αλλάξεις ή να καθαρίσεις τα φίλτρα</div>
    </div>
  );
}
