/**
 * Categories v0: Static category definitions for demo/fallback mode
 * When DB is online, these can be replaced with fetched categories
 */

export interface Category {
  id: number;
  slug: string;
  labelEl: string;
  labelEn: string;
  icon: string; // Lucide icon name
}

export const CATEGORIES: Category[] = [
  {
    id: 1,
    slug: 'olive-oil-olives',
    labelEl: 'Ελαιόλαδο & Ελιές',
    labelEn: 'Olive Oil & Olives',
    icon: 'Droplets',
  },
  {
    id: 2,
    slug: 'honey-bee',
    labelEl: 'Μέλι & Κυψέλη',
    labelEn: 'Honey & Bee Products',
    icon: 'Hexagon',
  },
  {
    id: 3,
    slug: 'legumes',
    labelEl: 'Όσπρια',
    labelEn: 'Legumes',
    icon: 'Bean',
  },
  {
    id: 4,
    slug: 'grains-rice',
    labelEl: 'Δημητριακά & Ρύζια',
    labelEn: 'Grains & Rice',
    icon: 'Wheat',
  },
  {
    id: 5,
    slug: 'pasta',
    labelEl: 'Ζυμαρικά',
    labelEn: 'Pasta',
    icon: 'Utensils',
  },
  {
    id: 6,
    slug: 'flours-bakery',
    labelEl: 'Αλεύρια & Αρτοποιία',
    labelEn: 'Flours & Bakery',
    icon: 'Croissant',
  },
  {
    id: 7,
    slug: 'nuts-dried',
    labelEl: 'Ξηροί Καρποί & Αποξηραμένα',
    labelEn: 'Nuts & Dried Fruits',
    icon: 'Nut',
  },
  {
    id: 8,
    slug: 'herbs-spices',
    labelEl: 'Βότανα & Μπαχαρικά',
    labelEn: 'Herbs & Spices',
    icon: 'Leaf',
  },
  {
    id: 9,
    slug: 'sweets-spreads',
    labelEl: 'Γλυκά, Μαρμελάδες & Αλείμματα',
    labelEn: 'Sweets, Jams & Spreads',
    icon: 'Cherry',
  },
  {
    id: 10,
    slug: 'sauces-preserves',
    labelEl: 'Σάλτσες, Conserves & Τουρσιά',
    labelEn: 'Sauces, Preserves & Pickles',
    icon: 'Soup',
  },
];

// Helper to get category by slug
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

// Helper to get all category slugs
export function getAllCategorySlugs(): string[] {
  return CATEGORIES.map((c) => c.slug);
}
