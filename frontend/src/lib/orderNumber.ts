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

export function parseOrderNo(ordNo: string): null | { dateStart: Date; dateEnd: Date; suffix: string } {
  if (!ordNo) return null;
  const m = /^DX-(\d{4})(\d{2})(\d{2})-([A-Z0-9]{4})$/i.exec(ordNo.trim());
  if (!m) return null;
  const y = Number(m[1]); const mo = Number(m[2]); const d = Number(m[3]);
  const dateStart = new Date(Date.UTC(y, mo-1, d, 0, 0, 0));
  const dateEnd   = new Date(Date.UTC(y, mo-1, d+1, 0, 0, 0)); // exclusive
  return { dateStart, dateEnd, suffix: m[4].toUpperCase() };
}
