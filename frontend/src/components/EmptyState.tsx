'use client';
import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
}

export default function EmptyState({
  icon,
  title = 'Δεν βρέθηκαν αποτελέσματα',
  message = 'Δοκίμασε να αλλάξεις ή να καθαρίσεις τα φίλτρα',
}: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
      aria-live="polite"
      className="grid gap-2 place-items-center text-center p-8 border border-dashed border-neutral-300 rounded-xl"
    >
      <div className="text-neutral-400 mb-1">
        {icon ?? (
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        )}
      </div>
      <div className="text-base font-semibold text-neutral-700">{title}</div>
      <div className="text-xs text-neutral-500">{message}</div>
    </div>
  );
}
