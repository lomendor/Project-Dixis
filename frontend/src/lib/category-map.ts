/**
 * Category slug mapping between Laravel and storefront.
 *
 * Phase 10: Backend and frontend now share the same 10 unified slugs.
 * This map handles any lingering legacy slugs during the transition period.
 * Once all products are migrated, this can be simplified to a passthrough.
 */

/** Map a Laravel category slug to the corresponding storefront slug. */
const LEGACY_TO_UNIFIED: Record<string, string> = {
  // Legacy slugs → unified slugs (transition period)
  'fruits': 'legumes-grains',
  'vegetables': 'legumes-grains',
  'herbs-spices': 'herbs-spices-tea',
  'grains-cereals': 'legumes-grains',
  'dairy-products': 'nuts-dried',
  'wine-beverages': 'beverages',
  'honey-preserves': 'honey-bee',
  'legumes': 'legumes-grains',
  'pasta-trahanas': 'pasta',
  'flours-bakery': 'legumes-grains',
  'nuts-dried-fruits': 'nuts-dried',
  'sweets-preserves': 'sweets-jams',
  'sauces-pickles': 'sauces-spreads',
  // Unified slugs map to themselves (identity)
  'olive-oil-olives': 'olive-oil-olives',
  'honey-bee': 'honey-bee',
  'nuts-dried': 'nuts-dried',
  'cosmetics': 'cosmetics',
  'beverages': 'beverages',
  'sweets-jams': 'sweets-jams',
  'pasta': 'pasta',
  'herbs-spices-tea': 'herbs-spices-tea',
  'sauces-spreads': 'sauces-spreads',
  'legumes-grains': 'legumes-grains',
};

/**
 * Convert a Laravel category slug to a storefront-compatible slug.
 * Returns the input unchanged if no mapping exists.
 */
export function toStorefrontSlug(laravelSlug: string | null | undefined): string | null {
  if (!laravelSlug) return null;
  return LEGACY_TO_UNIFIED[laravelSlug] ?? laravelSlug;
}
