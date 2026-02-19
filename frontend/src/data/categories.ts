/**
 * Categories v4: 9 locker-compatible categories
 * Removed: dairy, fruits-vegetables (need refrigeration), beverages (alcohol license)
 * Merged: grains-rice into legumes, flours-bakery into pasta
 * Added: cosmetics (natural cosmetics)
 * Icons: Lucide React SVGs (see CategoryStrip.tsx for rendering)
 */

export interface Category {
  id: number;
  slug: string;
  labelEl: string;
  labelEn: string;
  iconName: string; // Lucide icon name (rendered by CategoryStrip)
  /** Tailwind bg color class for unselected chip */
  chipBg: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 1,
    slug: 'olive-oil-olives',
    labelEl: 'Ελαιόλαδο & Ελιές',
    labelEn: 'Olive Oil & Olives',
    iconName: 'Droplets',
    chipBg: 'bg-category-olive',
  },
  {
    id: 2,
    slug: 'honey-bee',
    labelEl: 'Μέλι & Προϊόντα Μελισσοκομίας',
    labelEn: 'Honey & Bee Products',
    iconName: 'Flower2',
    chipBg: 'bg-category-honey',
  },
  {
    id: 3,
    slug: 'legumes-grains',
    labelEl: 'Όσπρια & Δημητριακά',
    labelEn: 'Legumes & Grains',
    iconName: 'Bean',
    chipBg: 'bg-category-vegetables',
  },
  {
    id: 4,
    slug: 'pasta-flours',
    labelEl: 'Ζυμαρικά & Αλεύρια',
    labelEn: 'Pasta & Flours',
    iconName: 'Wheat',
    chipBg: 'bg-category-bakery',
  },
  {
    id: 5,
    slug: 'nuts-dried',
    labelEl: 'Ξηροί Καρποί & Σνακ',
    labelEn: 'Nuts & Snacks',
    iconName: 'Nut',
    chipBg: 'bg-category-fruits',
  },
  {
    id: 6,
    slug: 'herbs-spices',
    labelEl: 'Βότανα & Μπαχαρικά',
    labelEn: 'Herbs & Spices',
    iconName: 'Leaf',
    chipBg: 'bg-category-vegetables',
  },
  {
    id: 7,
    slug: 'sweets-spreads',
    labelEl: 'Γλυκά & Αλείμματα',
    labelEn: 'Sweets & Spreads',
    iconName: 'Candy',
    chipBg: 'bg-category-fruits',
  },
  {
    id: 8,
    slug: 'sauces-preserves',
    labelEl: 'Σάλτσες & Τουρσιά',
    labelEn: 'Sauces & Pickles',
    iconName: 'CookingPot',
    chipBg: 'bg-category-meat',
  },
  {
    id: 9,
    slug: 'cosmetics',
    labelEl: 'Φυσικά Καλλυντικά',
    labelEn: 'Natural Cosmetics',
    iconName: 'Sparkles',
    chipBg: 'bg-category-dairy',
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
