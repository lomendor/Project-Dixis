export type OrderStatus = 'PAID'|'PACKING'|'SHIPPED'|'DELIVERED'|'CANCELLED';

const MAP: Record<OrderStatus, { label: string; bg: string; fg: string }> = {
  PAID: { label: 'Πληρωμή', bg: '#e6f4ea', fg: '#0b6b2b' },
  PACKING: { label: 'Συσκευασία', bg: '#eef2ff', fg: '#3b2db0' },
  SHIPPED: { label: 'Απεστάλη', bg: '#e6f1fb', fg: '#0b57d0' },
  DELIVERED: { label: 'Παραδόθηκε', bg: '#e8f0fe', fg: '#174ea6' },
  CANCELLED: { label: 'Ακυρώθηκε', bg: '#fde7e9', fg: '#a50e0e' },
};

export function StatusChip({ status }: { status: OrderStatus | undefined }) {
  const s = MAP[(status || 'PAID') as OrderStatus];
  return (
    <span
      data-testid="order-status-chip"
      style={{
        background: s.bg,
        color: s.fg,
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600
      }}
    >
      {s.label}
    </span>
  );
}
