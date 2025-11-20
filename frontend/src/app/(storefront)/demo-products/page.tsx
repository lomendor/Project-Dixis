export const revalidate = 60;

const DEMO = [
  { id: 'honey1', title: 'Μέλι Θυμαρίσιο', price: '€12.90', img: '/demo/honey.jpg', producer: 'Μελισσοκόμος Αιγαίου' },
  { id: 'oil1', title: 'Ελαιόλαδο Έξτρα Παρθένο', price: '€17.50', img: '/demo/olive-oil.jpg', producer: 'Ελαιώνας Κορινθίας' },
  { id: 'herb1', title: 'Ρίγανη Ορεινή', price: '€3.90', img: '/demo/oregano.jpg', producer: 'Βότανα Πίνδου' },
  { id: 'tea1', title: 'Τσάι του Βουνού', price: '€4.50', img: '/demo/mountain-tea.jpg', producer: 'Βότανα Ολύμπου' },
  { id: 'cheese1', title: 'Τυρί Γραβιέρα', price: '€9.80', img: '/demo/graviera.jpg', producer: 'Τυροκομείο Κρήτης' },
  { id: 'jam1', title: 'Μαρμελάδα Φράουλα', price: '€5.20', img: '/demo/strawberry-jam.jpg', producer: 'Εργαστήρι Γεύσεων' },
  { id: 'pasta1', title: 'Χυλοπίτες Παραδοσιακές', price: '€4.90', img: '/demo/pasta.jpg', producer: 'Μικρό Ζυμαράδικο' },
  { id: 'salt1', title: 'Αλάτι Ανθός', price: '€3.50', img: '/demo/sea-salt.jpg', producer: 'Αλυκές Μεσολογγίου' },
];

export default function Page() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Demo Προϊόντα</h1>
      <p className="text-sm text-neutral-600 mb-6">Προσωρινή προεπισκόπηση καταλόγου χωρίς βάση δεδομένων.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {DEMO.map(p => (
          <div key={p.id} className="border rounded-lg overflow-hidden bg-white">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <span className="text-xs">image: {p.img}</span>
            </div>
            <div className="p-4 space-y-2">
              <div className="text-base font-medium">{p.title}</div>
              <div className="text-sm text-neutral-600">{p.producer}</div>
              <div className="flex items-center justify-between">
                <div className="font-semibold">{p.price}</div>
                <button className="h-9 px-3 rounded bg-neutral-900 text-white text-sm">Προσθήκη</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-sm text-neutral-600">
        Tip: Ο κανονικός κατάλογος παραμένει στο <a className="underline" href="/products">/products</a>.
      </div>
    </main>
  );
}
