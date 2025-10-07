export const metadata = { title: 'Παρακολούθηση Παραγγελίας | Dixis' };

export default function Page() {
  return (
    <main style={{ display: 'grid', gap: 12, maxWidth: 520, padding: 16, margin: '0 auto' }}>
      <h1>Παρακολούθηση Παραγγελίας</h1>
      <form action="/orders/track" method="GET" style={{ display: 'grid', gap: 8 }}>
        <input name="id" placeholder="Αρ. Παραγγελίας" required />
        <input name="phone" placeholder="Κινητό (π.χ. +3069…)" required />
        <button type="submit">Προβολή</button>
      </form>
    </main>
  );
}
