export const metadata = { title: 'Για Παραγωγούς | Dixis' };

export default function ProducersLanding(){
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Γίνε μέλος του Dixis</h1>
      <p className="text-neutral-600 mt-2 max-w-2xl">
        Φέρνουμε τους τοπικούς παραγωγούς πιο κοντά σε καταναλωτές & επιχειρήσεις. Χωρίς αποθήκες — απευθείας από εσένα.
      </p>
      <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
        <li className="border rounded-md p-3 bg-white">✔ Κατάλογος προϊόντων & παραγγελίες</li>
        <li className="border rounded-md p-3 bg-white">✔ Υποστήριξη πιστοποιήσεων & συμμόρφωσης</li>
        <li className="border rounded-md p-3 bg-white">✔ Δίκαιη προμήθεια, διαφανείς όροι</li>
        <li className="border rounded-md p-3 bg-white">✔ Προώθηση & SEO για τα προϊόντα σου</li>
      </ul>
      <a href="/producers/waitlist" className="inline-flex h-10 px-4 rounded-md bg-brand text-white text-sm mt-6 items-center">
        Εκδήλωση ενδιαφέροντος →
      </a>
    </main>
  );
}
