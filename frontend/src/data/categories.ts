/**
 * Categories v3: 9 locker-compatible categories (was 10)
 * Removed: dairy, fruits-vegetables (need refrigeration), beverages (alcohol license)
 * Merged: grains-rice into legumes, flours-bakery into pasta
 * Added: cosmetics (natural cosmetics)
 * Icon PNGs stored in public/icons/categories/
 */

export interface Category {
  id: number;
  slug: string;
  labelEl: string;
  labelEn: string;
  emoji: string; // PNG filename (without extension) in public/icons/categories/
  /** Tailwind bg color class for unselected chip */
  chipBg: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 1,
    slug: 'olive-oil-olives',
    labelEl: 'Ελαιόλαδο & Ελιές',
    labelEn: 'Olive Oil & Olives',
    emoji: 'olive',
    chipBg: 'bg-category-olive',
  },
  {
    id: 2,
    slug: 'honey-bee',
    labelEl: 'Μέλι & Προϊόντα Μελισσοκομίας',
    labelEn: 'Honey & Bee Products',
    emoji: 'honey',
    chipBg: 'bg-category-honey',
  },
  {
    id: 3,
    slug: 'legumes-grains',
    labelEl: 'Όσπρια & Δημητριακά',
    labelEn: 'Legumes & Grains',
    emoji: 'beans',
    chipBg: 'bg-category-vegetables',
  },
  {
    id: 4,
    slug: 'pasta-flours',
    labelEl: 'Ζυμαρικά & Αλεύρια',
    labelEn: 'Pasta & Flours',
    emoji: 'pasta',
    chipBg: 'bg-category-bakery',
  },
  {
    id: 5,
    slug: 'nuts-dried',
    labelEl: 'Ξηροί Καρποί & Σνακ',
    labelEn: 'Nuts & Snacks',
    emoji: 'nuts',
    chipBg: 'bg-category-fruits',
  },
  {
    id: 6,
    slug: 'herbs-spices',
    labelEl: 'Βότανα & Μπαχαρικά',
    labelEn: 'Herbs & Spices',
    emoji: 'herbs',
    chipBg: 'bg-category-vegetables',
  },
  {
    id: 7,
    slug: 'sweets-spreads',
    labelEl: 'Γλυκά & Αλείμματα',
    labelEn: 'Sweets & Spreads',
    emoji: 'candy',
    chipBg: 'bg-category-fruits',
  },
  {
    id: 8,
    slug: 'sauces-preserves',
    labelEl: 'Σάλτσες & Τουρσιά',
    labelEn: 'Sauces & Pickles',
    emoji: 'jar',
    chipBg: 'bg-category-meat',
  },
  {
    id: 9,
    slug: 'cosmetics',
    labelEl: 'Φυσικά Καλλυντικά',
    labelEn: 'Natural Cosmetics',
    emoji: 'cosmetics',
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
