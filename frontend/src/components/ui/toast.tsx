'use client';
import * as React from 'react';

type T = { id: number; msg: string };

export function useToast() {
  const [items, set] = React.useState<T[]>([]);

  const toast = (msg: string) => set(s => [...s, { id: Date.now(), msg }]);
  const dismiss = (id: number) => set(s => s.filter(i => i.id !== id));

  const Toaster = () => (
    <div className="fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
      {items.map(i => (
        <div
          key={i.id}
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 shadow cursor-pointer"
          onClick={() => dismiss(i.id)}
        >
          {i.msg}
        </div>
      ))}
    </div>
  );

  return { toast, Toaster };
}
