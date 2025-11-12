export default function Trust() {
  const items = [
    { title: 'Απευθείας από παραγωγούς', desc: 'Στηρίζουμε μικρούς Έλληνες παραγωγούς με διαφάνεια.' },
    { title: 'Διαφανείς αποστολές', desc: 'Καθαρό κόστος μεταφορικών πριν το checkout.' },
    { title: 'Παρακολούθηση παραγγελίας', desc: 'Ζωντανή ενημέρωση κατάστασης & tracking.' },
  ];

  return (
    <section className="mt-10 rounded-xl border bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold">Γιατί Dixis</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <div key={i} className="rounded-lg border p-4 bg-neutral-50">
              <h3 className="text-sm font-semibold">{it.title}</h3>
              <p className="text-sm text-neutral-600 mt-1">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
