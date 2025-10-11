export function statusLabel(s?: string){
  const map: Record<string,string> = {
    PAID:'Πληρωμή',
    PACKING:'Συσκευασία',
    SHIPPED:'Απεστάλη',
    DELIVERED:'Παραδόθηκε',
    CANCELLED:'Ακυρώθηκε'
  }
  return map[String(s||'').toUpperCase()] || String(s||'—')
}
export function shippingLabel(m?: string){
  const map: Record<string,string> = {
    PICKUP:'Παραλαβή από κατάστημα',
    COURIER:'Κούριερ',
    COURIER_COD:'Κούριερ (Αντικαταβολή)'
  }
  return map[String(m||'').toUpperCase()] || '—'
}
