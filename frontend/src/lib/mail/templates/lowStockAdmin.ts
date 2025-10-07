export function subject(items: { title: string; stock: number }[], orderId: string) {
  const critical = items
    .slice(0, 3)
    .map((i) => i.title)
    .join(', ');
  return `Dixis — Χαμηλό απόθεμα (${critical}) • #${orderId}`;
}

export function text(params: {
  orderId: string;
  items: { title: string; stock: number }[];
  threshold: number;
}) {
  const lines = params.items.map((i) => `- ${i.title}: ${i.stock} τεμ.`).join('\n');
  return [
    `Παραγγελία #${params.orderId} οδήγησε σε χαμηλό απόθεμα (≤ ${params.threshold}):`,
    lines,
    '',
    'Πίνακας διαχείρισης: /admin/products?low=1'
  ].join('\n');
}
