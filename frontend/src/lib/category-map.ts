/**
 * Category slug mapping between Laravel (English, 8 categories)
 * and Prisma/storefront (Greek, 13 categories).
 *
 * STOREFRONT-LARAVEL-01 Phase 2: The storefront CategoryStrip uses Prisma
 * slugs (e.g. "fruits-vegetables"), but Laravel products carry Laravel
 * slugs (e.g. "fruits"). This mapping bridges the two until categories
 * are fully unified in Laravel.
 */

/** Map a Laravel category slug to the corresponding Prisma/storefront slug. */
const LARAVEL_TO_STOREFRONT: Record<string, string> = {
  'fruits': 'fruits-vegetables',
  'vegetables': 'fruits-vegetables',
  'herbs-spices': 'herbs-spices',
  'grains-cereals': 'grains-rice',
  'dairy-products': 'dairy',
  'olive-oil-olives': 'olive-oil-olives',
  'wine-beverages': 'beverages',
  'honey-preserves': 'honey-bee',
};

/**
 * Convert a Laravel category slug to a storefront-compatible slug.
 * Returns the input unchanged if no mapping exists.
 */
export function toStorefrontSlug(laravelSlug: string | null | undefined): string | null {
  if (!laravelSlug) return null;
  return LARAVEL_TO_STOREFRONT[laravelSlug] ?? laravelSlug;
}
