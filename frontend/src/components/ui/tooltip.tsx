'use client';
import * as React from 'react';

export function Tooltip({
  summary='Γιατί;',
  children
}: {
  summary?: string;
  children: React.ReactNode
}) {
  return (
    <details>
      <summary className="cursor-pointer text-sm text-neutral-700 hover:underline">{summary}</summary>
      <div className="mt-2 rounded-md border border-neutral-200 bg-white p-2 text-sm text-neutral-800 shadow">
        {children}
      </div>
    </details>
  );
}
