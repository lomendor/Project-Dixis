'use client';
import React, { useRef, useState } from 'react';

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
  maxMB?: number;
  label: string;
  hint?: string;
  required?: boolean;
};

/**
 * Reusable document upload component (PDF, images).
 * Based on UploadImage pattern but tailored for compliance documents.
 */
export default function UploadDocument({
  value,
  onChange,
  accept = 'application/pdf,image/jpeg,image/png',
  maxMB = 10,
  label,
  hint,
  required,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function doUpload(file: File) {
    setErr(null);
    if (!file) return;
    if (file.size > maxMB * 1024 * 1024) {
      setErr(`Το αρχείο υπερβαίνει τα ${maxMB}MB`);
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const headers: Record<string, string> = {};
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      const r = await fetch('/api/me/uploads', { method: 'POST', body: fd, headers });
      const j = await r.json();
      if (!r.ok) {
        setErr(j?.error || 'Σφάλμα ανεβάσματος');
        return;
      }
      onChange(j.url);
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) void doUpload(f);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void doUpload(f);
  }

  const isPdf = value?.endsWith('.pdf');
  const fileName = value?.split('/').pop() || '';

  return (
    <div>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
        {label}
        {required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      {hint && (
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>{hint}</p>
      )}
      {value ? (
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            padding: 12,
            background: '#f0fdf4',
            borderRadius: 8,
            border: '1px solid #bbf7d0',
          }}
        >
          {isPdf ? (
            <div
              style={{
                width: 48,
                height: 48,
                background: '#dc2626',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              PDF
            </div>
          ) : (
            <img
              src={value}
              alt={label}
              width={48}
              height={48}
              style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#15803d', fontWeight: 500 }}>
              Ανέβηκε
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: '#6b7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fileName}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button type="button" className="btn" onClick={() => onChange(null)}>
              Αφαίρεση
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? 'Ανέβασμα...' : 'Αντικατάσταση'}
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          style={{
            padding: 16,
            border: '2px dashed #d1d5db',
            borderRadius: 8,
            background: '#fafafa',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 8px', color: '#6b7280', fontSize: 14 }}>
            Σύρε εδώ ένα αρχείο (PDF ή εικόνα) ή
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? 'Ανέβασμα...' : 'Επίλεξε αρχείο'}
          </button>
          {err && <p style={{ color: '#b91c1c', marginTop: 8, fontSize: 13 }}>{err}</p>}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={onPick}
        aria-label={`Ανέβασμα ${label}`}
      />
    </div>
  );
}
