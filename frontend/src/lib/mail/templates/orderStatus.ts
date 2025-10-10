export function subject(orderId: string, status: string): string {
  const statusLabels: Record<string, string> = {
    PENDING: 'Εκκρεμής',
    PAID: 'Πληρώθηκε',
    PACKING: 'Συσκευασία',
    SHIPPED: 'Απεστάλη',
    DELIVERED: 'Παραδόθηκε',
    CANCELLED: 'Ακυρώθηκε'
  };

  const label = statusLabels[status] || status;
  return `Ενημέρωση Παραγγελίας ${orderId}: ${label}`;
}

export function html(data: { id: string; status: string }): string {
  const statusLabels: Record<string, string> = {
    PENDING: 'Εκκρεμής',
    PAID: 'Πληρώθηκε',
    PACKING: 'Συσκευασία',
    SHIPPED: 'Απεστάλη',
    DELIVERED: 'Παραδόθηκε',
    CANCELLED: 'Ακυρώθηκε'
  };

  const label = statusLabels[data.status] || data.status;

  return `
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ενημέρωση Παραγγελίας</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    <h1 style="color: #2563eb; margin-top: 0;">Ενημέρωση Παραγγελίας</h1>
    <p style="font-size: 16px; margin-bottom: 10px;">
      Η παραγγελία σας <strong>${data.id}</strong> έχει ενημερωθεί.
    </p>
    <p style="font-size: 18px; font-weight: 600; color: #2563eb; margin-top: 20px;">
      Κατάσταση: ${label}
    </p>
  </div>

  <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
    <h2 style="font-size: 18px; margin-top: 0;">Τι σημαίνει αυτό;</h2>
    <p style="margin-bottom: 10px;">
      ${getStatusDescription(data.status)}
    </p>
  </div>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
    <p>Ευχαριστούμε για την παραγγελία σας!</p>
    <p style="margin-top: 10px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3001'}/order/${data.id}"
         style="color: #2563eb; text-decoration: none;">
        Δείτε την παραγγελία σας
      </a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    PENDING: 'Η παραγγελία σας έχει ληφθεί και αναμένει επιβεβαίωση.',
    PAID: 'Η πληρωμή σας έχει επιβεβαιωθεί.',
    PACKING: 'Η παραγγελία σας βρίσκεται σε συσκευασία.',
    SHIPPED: 'Η παραγγελία σας έχει αποσταλεί και βρίσκεται καθ\' οδόν.',
    DELIVERED: 'Η παραγγελία σας έχει παραδοθεί επιτυχώς.',
    CANCELLED: 'Η παραγγελία σας έχει ακυρωθεί.'
  };

  return descriptions[status] || 'Η παραγγελία σας έχει ενημερωθεί.';
}
