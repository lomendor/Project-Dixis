'use client';
import React, { useRef, useState } from 'react';

export interface ImageItem {
  id?: number;
  url: string;
  is_primary: boolean;
}

type Props = {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
  maxMB?: number;
};

export default function MultiImageUpload({ images, onChange, maxImages = 6, maxMB = 5 }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function doUpload(file: File) {
    setErr(null);
    if (file.size > maxMB * 1024 * 1024) { setErr(`Max ${maxMB}MB`); return; }
    if (images.length >= maxImages) { setErr(`Max ${maxImages} images`); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const headers: Record<string, string> = {};
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const r = await fetch('/api/me/uploads', { method: 'POST', body: fd, headers });
      const j = await r.json();
      if (!r.ok) { setErr(j?.error || 'Upload failed'); return; }
      onChange([...images, { url: j.url, is_primary: images.length === 0 }]);
    } finally { setBusy(false); }
  }

  function removeImage(idx: number) {
    const updated = images.filter((_, i) => i !== idx);
    if (images[idx].is_primary && updated.length > 0) updated[0] = { ...updated[0], is_primary: true };
    onChange(updated);
  }

  function setPrimary(idx: number) {
    onChange(images.map((img, i) => ({ ...img, is_primary: i === idx })));
  }

  const StarIcon = () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
  const XIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <div>
      <label className="block mb-1.5 font-semibold text-sm text-neutral-700">
        Εικόνες Προϊόντος <span className="font-normal text-neutral-400">({images.length}/{maxImages})</span>
      </label>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-3">
          {images.map((img, idx) => (
            <div key={img.url} className="relative group rounded-lg overflow-hidden border border-neutral-200 aspect-square bg-neutral-100">
              <img src={img.url} alt={`Εικόνα ${idx + 1}`} className="w-full h-full object-cover" />
              {img.is_primary && (
                <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Κύρια</span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {!img.is_primary && (
                  <button type="button" onClick={() => setPrimary(idx)} className="p-1.5 bg-white rounded-full shadow text-neutral-700 hover:text-primary" title="Κύρια">
                    <StarIcon />
                  </button>
                )}
                <button type="button" onClick={() => removeImage(idx)} className="p-1.5 bg-white rounded-full shadow text-neutral-700 hover:text-red-600" title="Αφαίρεση">
                  <XIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {images.length < maxImages && (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) void doUpload(f); }}
          onClick={() => inputRef.current?.click()}
          className="p-4 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <p className="text-sm text-neutral-500">{busy ? 'Ανέβασμα…' : 'Σύρε εδώ ή κλίκαρε για εικόνα'}</p>
          <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WebP — μέχρι {maxMB}MB</p>
        </div>
      )}
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) void doUpload(f); if (inputRef.current) inputRef.current.value = ''; }} aria-label="Επιλογή εικόνας" />
    </div>
  );
}
