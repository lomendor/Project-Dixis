export function renderEmail(template: string, data: any){
  if (template === 'order_created') {
    return {
      subject: `Η παραγγελία #${data.orderId} καταχωρήθηκε`,
      html: `<p>Η παραγγελία σας (#${data.orderId}) καταχωρήθηκε επιτυχώς. Τεμάχια: <b>${data.items}</b>.</p>`
    };
  }
  if (template === 'order_status_changed') {
    return {
      subject: `Ενημέρωση παραγγελίας #${data.orderId}`,
      html: `<p>Η παραγγελία ενημερώθηκε: <b>${data.itemTitle}</b> → <b>${data.status}</b>.</p>`
    };
  }
  return { subject: 'Dixis', html: '<p>Ειδοποίηση</p>' };
}
