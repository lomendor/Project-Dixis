/**
 * Demo Products: Static product data for when API/DB is unavailable
 * Used as fallback when Neon quota exceeded or API down
 */

export interface DemoProduct {
  id: string;
  name: string;
  priceCents: number;
  unit: string;
  imageUrl?: string;
  producerId: string;
  producerName: string;
  categorySlug: string;
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  // Olive Oil & Olives - Producer: Ελαιώνες Μεσσηνίας (demo-producer-1)
  {
    id: 'demo-1',
    name: 'Εξαιρετικό Παρθένο Ελαιόλαδο Καλαμάτας',
    priceCents: 1850,
    unit: '750ml',
    producerId: 'demo-producer-1',
    producerName: 'Ελαιώνες Μεσσηνίας',
    categorySlug: 'olive-oil-olives',
  },
  {
    id: 'demo-2',
    name: 'Ελιές Καλαμών Βιολογικές',
    priceCents: 650,
    unit: '500g',
    producerId: 'demo-producer-1',
    producerName: 'Ελαιώνες Μεσσηνίας',
    categorySlug: 'olive-oil-olives',
  },
  // Honey & Bee - Producer: Κρητικά Μελισσοκομεία (demo-producer-2)
  {
    id: 'demo-3',
    name: 'Μέλι Θυμαρίσιο Κρήτης',
    priceCents: 1200,
    unit: '450g',
    producerId: 'demo-producer-2',
    producerName: 'Κρητικά Μελισσοκομεία',
    categorySlug: 'honey-bee',
  },
  // Honey & Bee - Producer: Μέλι Βορείου Ελλάδος (demo-producer-3)
  {
    id: 'demo-4',
    name: 'Μέλι Πεύκου Θάσου',
    priceCents: 980,
    unit: '500g',
    producerId: 'demo-producer-3',
    producerName: 'Μέλι Βορείου Ελλάδος',
    categorySlug: 'honey-bee',
  },
  // Legumes - Producer: Αγροτικός Συν/μός Πρεσπών (demo-producer-4)
  {
    id: 'demo-5',
    name: 'Φασόλια Γίγαντες Πρεσπών ΠΟΠ',
    priceCents: 750,
    unit: '500g',
    producerId: 'demo-producer-4',
    producerName: 'Αγροτικός Συν/μός Πρεσπών',
    categorySlug: 'legumes',
  },
  // Legumes - Producer: Green Farm Co. (demo-producer-5)
  {
    id: 'demo-6',
    name: 'Φακές Εγκλουβής Λευκάδας',
    priceCents: 480,
    unit: '500g',
    producerId: 'demo-producer-5',
    producerName: 'Green Farm Co.',
    categorySlug: 'legumes',
  },
  // Grains & Rice - Producer: Αγρόκτημα Σερρών (demo-producer-6)
  {
    id: 'demo-7',
    name: 'Ρύζι Καρολίνα Σερρών',
    priceCents: 420,
    unit: '1kg',
    producerId: 'demo-producer-6',
    producerName: 'Αγρόκτημα Σερρών',
    categorySlug: 'grains-rice',
  },
  // Grains & Rice - Producer: Ελληνικά Δημητριακά (demo-producer-7)
  {
    id: 'demo-8',
    name: 'Κριθαράκι Ολικής Άλεσης',
    priceCents: 380,
    unit: '500g',
    producerId: 'demo-producer-7',
    producerName: 'Ελληνικά Δημητριακά',
    categorySlug: 'grains-rice',
  },
  // Pasta - Producer: Γιαγιάς Ζυμαρικά (demo-producer-8)
  {
    id: 'demo-9',
    name: 'Χυλοπίτες Παραδοσιακές',
    priceCents: 450,
    unit: '500g',
    producerId: 'demo-producer-8',
    producerName: 'Γιαγιάς Ζυμαρικά',
    categorySlug: 'pasta',
  },
  {
    id: 'demo-10',
    name: 'Τραχανάς Ξινός Χειροποίητος',
    priceCents: 520,
    unit: '500g',
    producerId: 'demo-producer-8',
    producerName: 'Γιαγιάς Ζυμαρικά',
    categorySlug: 'pasta',
  },
  // Flours & Bakery - Producer: Βιο-Αλεύρια Θεσσαλίας (demo-producer-9)
  {
    id: 'demo-11',
    name: 'Αλεύρι Ζέας Βιολογικό',
    priceCents: 580,
    unit: '1kg',
    producerId: 'demo-producer-9',
    producerName: 'Βιο-Αλεύρια Θεσσαλίας',
    categorySlug: 'flours-bakery',
  },
  // Nuts & Dried - Producer: Φιστικοπαραγωγοί Αιγίνης (demo-producer-10)
  {
    id: 'demo-12',
    name: 'Φιστίκια Αιγίνης Ωμά',
    priceCents: 1450,
    unit: '250g',
    producerId: 'demo-producer-10',
    producerName: 'Φιστικοπαραγωγοί Αιγίνης',
    categorySlug: 'nuts-dried',
  },
  // Nuts & Dried - Producer: Αγρόκτημα Κύμης (demo-producer-11)
  {
    id: 'demo-13',
    name: 'Σύκα Αποξηραμένα Εύβοιας',
    priceCents: 680,
    unit: '400g',
    producerId: 'demo-producer-11',
    producerName: 'Αγρόκτημα Κύμης',
    categorySlug: 'nuts-dried',
  },
  // Herbs & Spices - Producer: Βότανα Μάνης (demo-producer-12)
  {
    id: 'demo-14',
    name: 'Ρίγανη Βουνού Ταϋγέτου',
    priceCents: 350,
    unit: '100g',
    producerId: 'demo-producer-12',
    producerName: 'Βότανα Μάνης',
    categorySlug: 'herbs-spices',
  },
  // Herbs & Spices - Producer: Κροκοπαραγωγοί Κοζάνης (demo-producer-13)
  {
    id: 'demo-15',
    name: 'Κρόκος Κοζάνης ΠΟΠ',
    priceCents: 1200,
    unit: '1g',
    producerId: 'demo-producer-13',
    producerName: 'Κροκοπαραγωγοί Κοζάνης',
    categorySlug: 'herbs-spices',
  },
  // Sweets & Spreads - Producer: Χιώτικα Γλυκά (demo-producer-14)
  {
    id: 'demo-16',
    name: 'Μαρμελάδα Πορτοκάλι Χίου',
    priceCents: 480,
    unit: '380g',
    producerId: 'demo-producer-14',
    producerName: 'Χιώτικα Γλυκά',
    categorySlug: 'sweets-spreads',
  },
  // Sweets & Spreads - Producer: Αμπελώνες Νεμέας (demo-producer-15)
  {
    id: 'demo-17',
    name: 'Πετιμέζι Παραδοσιακό',
    priceCents: 550,
    unit: '500ml',
    producerId: 'demo-producer-15',
    producerName: 'Αμπελώνες Νεμέας',
    categorySlug: 'sweets-spreads',
  },
  // Sauces & Preserves - Producer: Σαντορινιά Γεύση (demo-producer-16)
  {
    id: 'demo-18',
    name: 'Σάλτσα Ντομάτας Σαντορίνης',
    priceCents: 420,
    unit: '500g',
    producerId: 'demo-producer-16',
    producerName: 'Σαντορινιά Γεύση',
    categorySlug: 'sauces-preserves',
  },
];

// Helper to filter products by category
export function filterProductsByCategory(categorySlug: string | null): DemoProduct[] {
  if (!categorySlug) return DEMO_PRODUCTS;
  return DEMO_PRODUCTS.filter((p) => p.categorySlug === categorySlug);
}
