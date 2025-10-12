import { baseText } from './base'

export function subject(orderId: string) {
  return `Dixis — Νέα Παραγγελία #${orderId}`;
}

export function text(params: {
  id: string;
  buyerName: string;
  buyerPhone: string;
  total: number;
}) {
  const fmt = (n: number) => new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n)

  const lines = [
    `Νέα παραγγελία #${params.id}`,
    `Πελάτης: ${params.buyerName || '—'}`,
    `Τηλέφωνο: ${params.buyerPhone || '—'}`,
    `Σύνολο: ${fmt(params.total || 0)}`,
    '',
    `Λεπτομέρειες: /admin/orders/${params.id}`
  ];

  return baseText(subject(params.id), lines);
}
