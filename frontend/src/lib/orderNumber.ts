function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export function orderNumber(id: string, createdAt?: string | Date): string {
  const safeId = (id || '').replace(/[^a-z0-9]/gi, '');
  const suffix = (safeId.slice(-4) || '0000').toUpperCase();
  const d = createdAt ? new Date(createdAt) : new Date();
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `DX-${y}${m}${day}-${suffix}`;
}
