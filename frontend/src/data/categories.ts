/**
 * Categories v5: 10 definitive locker-compatible categories
 *
 * Phase 10: Unified backend + frontend taxonomy.
 * All shelf-stable, parcel-deliverable Greek artisan products.
 * Icons: Lucide React SVGs (see CategoryStrip.tsx for rendering)
 */

export interface Category {
  id: number;
  slug: string;
  labelEl: string;
  labelEn: string;
  iconName: string; // Lucide icon name (rendered by CategoryStrip)
  /** Tailwind bg color class for card */
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
    labelEl: 'Μέλι & Προϊόντα Μέλισσας',
    labelEn: 'Honey & Bee Products',
    iconName: 'Flower2',
    chipBg: 'bg-category-honey',
  },
  {
    id: 3,
    slug: 'nuts-dried',
    labelEl: 'Ξηροί Καρποί',
    labelEn: 'Nuts & Dried Fruits',
    iconName: 'Nut',
    chipBg: 'bg-category-nuts',
  },
  {
    id: 4,
    slug: 'cosmetics',
    labelEl: 'Φυσικά Καλλυντικά',
    labelEn: 'Natural Cosmetics',
    iconName: 'Sparkles',
    chipBg: 'bg-category-cosmetics',
  },
  {
    id: 5,
    slug: 'beverages',
    labelEl: 'Ποτά',
    labelEn: 'Beverages',
    iconName: 'Grape',
    chipBg: 'bg-category-beverages',
  },
  {
    id: 6,
    slug: 'sweets-jams',
    labelEl: 'Γλυκά & Μαρμελάδες',
    labelEn: 'Sweets & Jams',
    iconName: 'Candy',
    chipBg: 'bg-category-sweets',
  },
  {
    id: 7,
    slug: 'pasta',
    labelEl: 'Ζυμαρικά',
    labelEn: 'Pasta',
    iconName: 'Wheat',
    chipBg: 'bg-category-pasta',
  },
  {
    id: 8,
    slug: 'herbs-spices-tea',
    labelEl: 'Βότανα, Μπαχαρικά & Τσάι',
    labelEn: 'Herbs, Spices & Tea',
    iconName: 'Leaf',
    chipBg: 'bg-category-herbs',
  },
  {
    id: 9,
    slug: 'sauces-spreads',
    labelEl: 'Σάλτσες & Αλείμματα',
    labelEn: 'Sauces & Spreads',
    iconName: 'CookingPot',
    chipBg: 'bg-category-sauces',
  },
  {
    id: 10,
    slug: 'legumes-grains',
    labelEl: 'Όσπρια & Δημητριακά',
    labelEn: 'Legumes & Grains',
    iconName: 'Bean',
    chipBg: 'bg-category-legumes',
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
