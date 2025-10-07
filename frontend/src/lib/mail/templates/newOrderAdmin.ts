export function subject(orderId: string) {
  return `Dixis — Νέα Παραγγελία #${orderId}`;
}

export function text(params: {
  id: string;
  buyerName: string;
  buyerPhone: string;
  total: number;
}) {
  return [
    `Νέα παραγγελία #${params.id}`,
    '',
    `Πελάτης: ${params.buyerName}`,
    `Τηλέφωνο: ${params.buyerPhone}`,
    `Σύνολο: €${params.total.toFixed(2)}`,
    '',
    `Λεπτομέρειες: /admin/orders/${params.id}`
  ].join('\n');
}
