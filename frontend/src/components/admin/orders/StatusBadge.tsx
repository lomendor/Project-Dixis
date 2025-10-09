'use client';

export default function StatusBadge({ status }: { status: string }) {
  const s = String(status || '').toUpperCase();
  const styles: Record<string, { bg: string; text: string }> = {
    PAID: { bg: '#2563eb', text: '#fff' },
    PACKING: { bg: '#f59e0b', text: '#fff' },
    SHIPPED: { bg: '#6366f1', text: '#fff' },
    DELIVERED: { bg: '#16a34a', text: '#fff' },
    CANCELLED: { bg: '#6b7280', text: '#fff' },
  };
  const style = styles[s] || { bg: '#6b7280', text: '#fff' };

  return (
    <span style={{
      background: style.bg,
      color: style.text,
      padding: '4px 8px',
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 500
    }}>
      {s}
    </span>
  );
}
