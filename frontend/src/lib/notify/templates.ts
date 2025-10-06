export function renderSMS(tpl: string, data: any): string {
  if(tpl==='order_created'){
    return `Dixis: Η παραγγελία #${data.orderId} καταχωρήθηκε. Τεμάχια: ${data.items}. Ευχαριστούμε!`;
  }
  if(tpl==='order_status_changed'){
    return `Dixis: Η παραγγελία #${data.orderId} ενημερώθηκε: ${data.itemTitle} → ${data.status}.`;
  }
  return 'Dixis: Ειδοποίηση.';
}
