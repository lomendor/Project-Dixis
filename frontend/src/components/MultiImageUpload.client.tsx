'use client';
import React, { useRef, useState } from 'react';

type ImageItem = { url: string; uploading?: boolean };

type Props = {
  value: string[];                   // array of image URLs (ordered; first = primary)
  onChange: (urls: string[]) => void;
  max?: number;                      // default 5
  maxMB?: number;                    // per file, default 5
  label?: string;
};

/**
 * Multi-image upload with reorder (move up/down), delete, and drag-to-add.
 * First image is always treated as primary.
 */
export default function MultiImageUpload({
  value,
  onChange,
  max = 5,
  maxMB = 5,
  label = 'Εικόνες προϊόντος',
}: Props) {
  const [items, setItems] = useState<ImageItem[]>(
    value.map((url) => ({ url }))
  );
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep parent in sync whenever items change
  function commit(next: ImageItem[]) {
    setItems(next);
    onChange(next.filter((i) => !i.uploading).map((i) => i.url));
  }

  async function doUpload(file: File) {
    setErr(null);
    if (items.length >= max) {
      setErr(`Μέγιστο ${max} εικόνες`);
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      setErr(`Το αρχείο υπερβαίνει τα ${maxMB}MB`);
      return;
    }

    // Add placeholder
    const placeholder: ImageItem = { url: '', uploading: true };
    const withPlaceholder = [...items, placeholder];
    setItems(withPlaceholder);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/me/uploads', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      if (!r.ok) {
        const j = await r.json().catch((): null => null);
        setErr(j?.error || (r.status === 401 ? 'Απαιτείται σύνδεση' : 'Σφάλμα ανεβάσματος'));
        setItems(items); // revert
        return;
      }
      const j = await r.json();
      const next = items.concat({ url: j.url });
      commit(next);
    } catch {
      setErr('Σφάλμα ανεβάσματος');
      setItems(items); // revert
    }
  }

  function remove(idx: number) {
    const next = items.filter((_, i) => i !== idx);
    commit(next);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    commit(next);
  }

  function moveDown(idx: number) {
    if (idx >= items.length - 1) return;
    const next = [...items];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    commit(next);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );
    for (const f of files) void doUpload(f);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    for (const f of files) void doUpload(f);
    if (inputRef.current) inputRef.current.value = '';
  }

  const canAdd = items.filter((i) => !i.uploading).length < max;
  const uploading = items.some((i) => i.uploading);

  return (
    <div>
      <label className="block mb-1.5 font-semibold text-sm">{label}</label>
      <p className="text-xs text-neutral-500 mb-2">
        Μέχρι {max} εικόνες. Η πρώτη είναι η κύρια εικόνα.
      </p>

      {/* Image grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {items.map((item, idx) => (
            <div
              key={item.url || `uploading-${idx}`}
              className="relative group rounded-lg border border-neutral-200 overflow-hidden aspect-square bg-neutral-50"
            >
              {item.uploading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <>
                  <img
                    src={item.url}
                    alt={`Εικόνα ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Κύρια
                    </span>
                  )}
                  {/* Controls overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => moveUp(idx)}
                        className="bg-white/90 rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-white"
                        title="Μετακίνηση αριστερά"
                      >
                        ←
                      </button>
                    )}
                    {idx < items.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveDown(idx)}
                        className="bg-white/90 rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-white"
                        title="Μετακίνηση δεξιά"
                      >
                        →
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="bg-red-500/90 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600"
                      title="Αφαίρεση"
                    >
                      ✕
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone / Add button */}
      {canAdd && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="p-4 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50 text-center"
        >
          <p className="text-sm text-neutral-500 mb-2">
            Σύρε εδώ εικόνες ή
          </p>
          <button
            type="button"
            className="px-4 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-primary/90 disabled:opacity-50"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Ανέβασμα…' : 'Επίλεξε αρχεία'}
          </button>
        </div>
      )}

      {err && <p className="text-red-700 text-sm mt-1">{err}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onPick}
        aria-label="Επιλογή αρχείων"
      />
    </div>
  );
}
