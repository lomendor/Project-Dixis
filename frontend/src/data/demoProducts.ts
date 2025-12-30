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
  producerName: string;
  categorySlug: string;
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  // Olive Oil & Olives
  {
    id: 'demo-1',
    name: 'Εξαιρετικό Παρθένο Ελαιόλαδο Καλαμάτας',
    priceCents: 1850,
    unit: '750ml',
    producerName: 'Ελαιώνες Μεσσηνίας',
    categorySlug: 'olive-oil-olives',
  },
  {
    id: 'demo-2',
    name: 'Ελιές Καλαμών Βιολογικές',
    priceCents: 650,
    unit: '500g',
    producerName: 'Ελαιώνες Μεσσηνίας',
    categorySlug: 'olive-oil-olives',
  },
  // Honey & Bee
  {
    id: 'demo-3',
    name: 'Μέλι Θυμαρίσιο Κρήτης',
    priceCents: 1200,
    unit: '450g',
    producerName: 'Κρητικά Μελισσοκομεία',
    categorySlug: 'honey-bee',
  },
  {
    id: 'demo-4',
    name: 'Μέλι Πεύκου Θάσου',
    priceCents: 980,
    unit: '500g',
    producerName: 'Μέλι Βορείου Ελλάδος',
    categorySlug: 'honey-bee',
  },
  // Legumes
  {
    id: 'demo-5',
    name: 'Φασόλια Γίγαντες Πρεσπών ΠΟΠ',
    priceCents: 750,
    unit: '500g',
    producerName: 'Αγροτικός Συν/μός Πρεσπών',
    categorySlug: 'legumes',
  },
  {
    id: 'demo-6',
    name: 'Φακές Εγκλουβής Λευκάδας',
    priceCents: 480,
    unit: '500g',
    producerName: 'Green Farm Co.',
    categorySlug: 'legumes',
  },
  // Grains & Rice
  {
    id: 'demo-7',
    name: 'Ρύζι Καρολίνα Σερρών',
    priceCents: 420,
    unit: '1kg',
    producerName: 'Αγρόκτημα Σερρών',
    categorySlug: 'grains-rice',
  },
  {
    id: 'demo-8',
    name: 'Κριθαράκι Ολικής Άλεσης',
    priceCents: 380,
    unit: '500g',
    producerName: 'Ελληνικά Δημητριακά',
    categorySlug: 'grains-rice',
  },
  // Pasta
  {
    id: 'demo-9',
    name: 'Χυλοπίτες Παραδοσιακές',
    priceCents: 450,
    unit: '500g',
    producerName: 'Γιαγιάς Ζυμαρικά',
    categorySlug: 'pasta',
  },
  {
    id: 'demo-10',
    name: 'Τραχανάς Ξινός Χειροποίητος',
    priceCents: 520,
    unit: '500g',
    producerName: 'Γιαγιάς Ζυμαρικά',
    categorySlug: 'pasta',
  },
  // Flours & Bakery
  {
    id: 'demo-11',
    name: 'Αλεύρι Ζέας Βιολογικό',
    priceCents: 580,
    unit: '1kg',
    producerName: 'Βιο-Αλεύρια Θεσσαλίας',
    categorySlug: 'flours-bakery',
  },
  // Nuts & Dried
  {
    id: 'demo-12',
    name: 'Φιστίκια Αιγίνης Ωμά',
    priceCents: 1450,
    unit: '250g',
    producerName: 'Φιστικοπαραγωγοί Αιγίνης',
    categorySlug: 'nuts-dried',
  },
  {
    id: 'demo-13',
    name: 'Σύκα Αποξηραμένα Εύβοιας',
    priceCents: 680,
    unit: '400g',
    producerName: 'Αγρόκτημα Κύμης',
    categorySlug: 'nuts-dried',
  },
  // Herbs & Spices
  {
    id: 'demo-14',
    name: 'Ρίγανη Βουνού Ταϋγέτου',
    priceCents: 350,
    unit: '100g',
    producerName: 'Βότανα Μάνης',
    categorySlug: 'herbs-spices',
  },
  {
    id: 'demo-15',
    name: 'Κρόκος Κοζάνης ΠΟΠ',
    priceCents: 1200,
    unit: '1g',
    producerName: 'Κροκοπαραγωγοί Κοζάνης',
    categorySlug: 'herbs-spices',
  },
  // Sweets & Spreads
  {
    id: 'demo-16',
    name: 'Μαρμελάδα Πορτοκάλι Χίου',
    priceCents: 480,
    unit: '380g',
    producerName: 'Χιώτικα Γλυκά',
    categorySlug: 'sweets-spreads',
  },
  {
    id: 'demo-17',
    name: 'Πετιμέζι Παραδοσιακό',
    priceCents: 550,
    unit: '500ml',
    producerName: 'Αμπελώνες Νεμέας',
    categorySlug: 'sweets-spreads',
  },
  // Sauces & Preserves
  {
    id: 'demo-18',
    name: 'Σάλτσα Ντομάτας Σαντορίνης',
    priceCents: 420,
    unit: '500g',
    producerName: 'Σαντορινιά Γεύση',
    categorySlug: 'sauces-preserves',
  },
];

// Helper to filter products by category
export function filterProductsByCategory(categorySlug: string | null): DemoProduct[] {
  if (!categorySlug) return DEMO_PRODUCTS;
  return DEMO_PRODUCTS.filter((p) => p.categorySlug === categorySlug);
}
