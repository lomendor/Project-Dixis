/**
 * Category slug mapping between Laravel and Prisma/storefront.
 *
 * STOREFRONT-LARAVEL-01 Phase 2-3: The storefront CategoryStrip uses Prisma
 * slugs (e.g. "fruits-vegetables"), but Laravel products carry Laravel
 * slugs (e.g. "fruits"). This mapping bridges the two until categories
 * are fully unified in Laravel.
 */

/** Map a Laravel category slug to the corresponding Prisma/storefront slug. */
const LARAVEL_TO_STOREFRONT: Record<string, string> = {
  // Original 8 categories
  'fruits': 'fruits-vegetables',
  'vegetables': 'fruits-vegetables',
  'herbs-spices': 'herbs-spices',
  'grains-cereals': 'grains-rice',
  'dairy-products': 'dairy',
  'olive-oil-olives': 'olive-oil-olives',
  'wine-beverages': 'beverages',
  'honey-preserves': 'honey-bee',
  // Phase 3: New categories added for Greek products
  'legumes': 'legumes',
  'pasta-trahanas': 'pasta',
  'flours-bakery': 'flours-bakery',
  'nuts-dried-fruits': 'nuts-dried',
  'sweets-preserves': 'sweets-spreads',
  'sauces-pickles': 'sauces-preserves',
};

/**
 * Convert a Laravel category slug to a storefront-compatible slug.
 * Returns the input unchanged if no mapping exists.
 */
export function toStorefrontSlug(laravelSlug: string | null | undefined): string | null {
  if (!laravelSlug) return null;
  return LARAVEL_TO_STOREFRONT[laravelSlug] ?? laravelSlug;
}
