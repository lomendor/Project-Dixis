export function subject(id:string){ return `Dixis — Νέα Αίτηση Παραγωγού #${id}`; }

export function text(a:any){
  return [
    `Αίτηση #${a.id}`,
    `Όνομα: ${a.producerName}`,
    `Επωνυμία: ${a.companyName||'—'}`,
    `ΑΦΜ: ${a.afm||'—'}`,
    `Email: ${a.email}`,
    `Τηλ: ${a.phone||'—'}`,
    `Κατηγορίες: ${a.categories||'—'}`,
    `Σημειώσεις: ${(a.note||'').slice(0,500)}`
  ].join('\n');
}
