'use client';
import { useState } from 'react';

export default function ImageUploadField({
  name = 'imageUrl',
  onUrl
}: {
  name?: string;
  onUrl?: (url: string) => void;
}) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setBusy(true);
    setErr(null);

    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || 'Αποτυχία αποστολής');

      setUrl(json.url);
      onUrl?.(json.url);

      // Γέμισε και το κρυφό input, αν υπάρχει
      const inp = document.querySelector(`input[name="${name}"]`) as HTMLInputElement | null;
      if (inp) {
        inp.value = json.url;
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch (e: any) {
      setErr(e?.message || 'Σφάλμα');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Εικόνα προϊόντος (upload)
      </label>
      <input
        data-testid="image-file"
        type="file"
        accept="image/*"
        onChange={onFile}
        disabled={busy}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      {busy && <small className="text-gray-500">Ανέβασμα...</small>}
      {err && <small className="text-red-600">{err}</small>}
      {url && (
        <img
          src={url}
          alt="Προεπισκόπηση"
          className="max-w-60 border border-gray-200 rounded-lg"
        />
      )}
    </div>
  );
}
