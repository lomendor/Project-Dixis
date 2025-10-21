'use client';
import React from 'react';

type Props = {
  show: boolean;
  text: string;
  /** προαιρετικά extra testIds για backward-compat με υπάρχοντα tests (π.χ. copy-toast, chips-toast) */
  extraTestIds?: string[];
};
export default function ToastSuccess({ show, text, extraTestIds=[] }: Props) {
  if (!show) {
    return (
      <div data-testid="toast-success" aria-live="polite" style={{display:'none'}} className="text-xs text-green-700">
        {text}
      </div>
    );
  }
  return (
    <div data-testid="toast-success" aria-live="polite" className="text-xs text-green-700">
      {text}
      {/* Back-compat: render ίδια ένδειξη και με παλιά testIds ώστε παλιά E2E να παραμείνουν έγκυρα */}
      {extraTestIds.map(id => (
        <span key={id} data-testid={id} className="text-xs text-green-700" style={{marginLeft: 8}}>
          {text}
        </span>
      ))}
    </div>
  );
}
