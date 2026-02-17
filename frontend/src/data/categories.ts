/**
 * Categories v1: Static category definitions with Fluent Emoji 3D icons
 * When DB is online, these can be replaced with fetched categories
 * Emoji PNGs: Microsoft Fluent Emoji (MIT), stored in public/icons/categories/
 */

export interface Category {
  id: number;
  slug: string;
  labelEl: string;
  labelEn: string;
  icon: string; // Lucide icon name (legacy)
  emoji: string; // Fluent Emoji 3D PNG filename (without extension)
  /** Tailwind bg color class for unselected chip */
  chipBg: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 1,
    slug: 'olive-oil-olives',
    labelEl: 'Ελαιόλαδο & Ελιές',
    labelEn: 'Olive Oil & Olives',
    icon: 'Droplets',
    emoji: 'olive',
    chipBg: 'bg-category-olive',
  },
  {
    id: 2,
    slug: 'honey-bee',
    labelEl: 'Μέλι & Κυψέλη',
    labelEn: 'Honey & Bee Products',
    icon: 'Hexagon',
    emoji: 'honey',
    chipBg: 'bg-category-honey',
  },
  {
    id: 3,
    slug: 'legumes',
    labelEl: 'Όσπρια',
    labelEn: 'Legumes',
    icon: 'Bean',
    emoji: 'beans',
    chipBg: 'bg-category-vegetables',
  },
  {
    id: 4,
    slug: 'grains-rice',
    labelEl: 'Δημητριακά & Ρύζια',
    labelEn: 'Grains & Rice',
    icon: 'Wheat',
    emoji: 'rice',
    chipBg: 'bg-category-bakery',
  },
  {
    id: 5,
    slug: 'pasta',
    labelEl: 'Ζυμαρικά',
    labelEn: 'Pasta',
    icon: 'Utensils',
    emoji: 'pasta',
    chipBg: 'bg-category-bakery',
  },
  {
    id: 6,
    slug: 'flours-bakery',
    labelEl: 'Αλεύρια & Αρτοποιία',
    labelEn: 'Flours & Bakery',
    icon: 'Croissant',
    emoji: 'bread',
    chipBg: 'bg-category-bakery',
  },
  {
    id: 7,
    slug: 'nuts-dried',
    labelEl: 'Ξηροί Καρποί & Αποξηραμένα',
    labelEn: 'Nuts & Dried Fruits',
    icon: 'Nut',
    emoji: 'nuts',
    chipBg: 'bg-category-fruits',
  },
  {
    id: 8,
    slug: 'herbs-spices',
    labelEl: 'Βότανα & Μπαχαρικά',
    labelEn: 'Herbs & Spices',
    icon: 'Leaf',
    emoji: 'herbs',
    chipBg: 'bg-category-vegetables',
  },
  {
    id: 9,
    slug: 'sweets-spreads',
    labelEl: 'Γλυκά, Μαρμελάδες & Αλείμματα',
    labelEn: 'Sweets, Jams & Spreads',
    icon: 'Cherry',
    emoji: 'candy',
    chipBg: 'bg-category-fruits',
  },
  {
    id: 10,
    slug: 'sauces-preserves',
    labelEl: 'Σάλτσες, Conserves & Τουρσιά',
    labelEn: 'Sauces, Preserves & Pickles',
    icon: 'Soup',
    emoji: 'jar',
    chipBg: 'bg-category-meat',
  },
  {
    id: 11,
    slug: 'beverages',
    labelEl: 'Ποτά & Αποστάγματα',
    labelEn: 'Beverages & Spirits',
    icon: 'Wine',
    emoji: 'beverage',
    chipBg: 'bg-category-wine',
  },
  {
    id: 12,
    slug: 'dairy',
    labelEl: 'Γαλακτοκομικά',
    labelEn: 'Dairy Products',
    icon: 'Milk',
    emoji: 'cheese',
    chipBg: 'bg-category-dairy',
  },
  {
    id: 13,
    slug: 'fruits-vegetables',
    labelEl: 'Φρούτα & Λαχανικά',
    labelEn: 'Fruits & Vegetables',
    icon: 'Apple',
    emoji: 'apple',
    chipBg: 'bg-category-fruits',
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
