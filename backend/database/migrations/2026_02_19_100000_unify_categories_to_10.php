<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Unify 14 legacy categories into 10 definitive categories.
 *
 * Phase 10: Merges, renames and deletes categories so that the storefront
 * and backend share the same 10 locker-compatible slugs.
 *
 * Slug mapping (old → new):
 *   olive-oil-olives   → olive-oil-olives (unchanged)
 *   honey-preserves    → honey-bee
 *   nuts-dried-fruits   → nuts-dried
 *   cosmetics          → cosmetics (created if missing)
 *   wine-beverages     → beverages
 *   sweets-preserves   → sweets-jams
 *   pasta-trahanas     → pasta
 *   herbs-spices       → herbs-spices-tea
 *   sauces-pickles     → sauces-spreads
 *   legumes + grains-cereals + flours-bakery → legumes-grains
 *   dairy-products     → nuts-dried (reassign products)
 *   fruits             → DELETE (not shelf-stable)
 *   vegetables         → DELETE (not shelf-stable)
 */
return new class extends Migration
{
    /**
     * The 10 definitive categories to create/ensure.
     */
    private const TARGET_CATEGORIES = [
        'olive-oil-olives'  => 'Ελαιόλαδο & Ελιές',
        'honey-bee'         => 'Μέλι & Προϊόντα Μέλισσας',
        'nuts-dried'        => 'Ξηροί Καρποί',
        'cosmetics'         => 'Φυσικά Καλλυντικά',
        'beverages'         => 'Ποτά',
        'sweets-jams'       => 'Γλυκά & Μαρμελάδες',
        'pasta'             => 'Ζυμαρικά',
        'herbs-spices-tea'  => 'Βότανα, Μπαχαρικά & Τσάι',
        'sauces-spreads'    => 'Σάλτσες & Αλείμματα',
        'legumes-grains'    => 'Όσπρια & Δημητριακά',
    ];

    /**
     * Old slug → new slug mapping for product reassignment.
     * Slugs not listed here are either unchanged or deleted.
     */
    private const SLUG_MAP = [
        'honey-preserves'  => 'honey-bee',
        'nuts-dried-fruits' => 'nuts-dried',
        'wine-beverages'   => 'beverages',
        'sweets-preserves' => 'sweets-jams',
        'pasta-trahanas'   => 'pasta',
        'herbs-spices'     => 'herbs-spices-tea',
        'sauces-pickles'   => 'sauces-spreads',
        'legumes'          => 'legumes-grains',
        'grains-cereals'   => 'legumes-grains',
        'flours-bakery'    => 'legumes-grains',
        'dairy-products'   => 'nuts-dried',
    ];

    /**
     * Old slugs whose products are deleted (not shelf-stable).
     */
    private const DELETE_SLUGS = [
        'fruits',
        'vegetables',
    ];

    public function up(): void
    {
        // Step 1: Create all 10 target categories (if they don't exist)
        $now = now();
        foreach (self::TARGET_CATEGORIES as $slug => $name) {
            $exists = DB::table('categories')->where('slug', $slug)->exists();
            if (! $exists) {
                DB::table('categories')->insert([
                    'name' => $name,
                    'slug' => $slug,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            } else {
                // Update the name to the definitive Greek name
                DB::table('categories')
                    ->where('slug', $slug)
                    ->update(['name' => $name, 'updated_at' => $now]);
            }
        }

        // Step 2: Reassign products from old categories to new ones
        foreach (self::SLUG_MAP as $oldSlug => $newSlug) {
            $oldCat = DB::table('categories')->where('slug', $oldSlug)->first();
            $newCat = DB::table('categories')->where('slug', $newSlug)->first();

            if (! $oldCat || ! $newCat) {
                continue; // Skip if source or target doesn't exist
            }

            // Get product IDs that are currently assigned to old category
            $productIds = DB::table('category_product')
                ->where('category_id', $oldCat->id)
                ->pluck('product_id')
                ->toArray();

            foreach ($productIds as $productId) {
                // Check if product already has the new category
                $alreadyHas = DB::table('category_product')
                    ->where('product_id', $productId)
                    ->where('category_id', $newCat->id)
                    ->exists();

                if (! $alreadyHas) {
                    DB::table('category_product')->insert([
                        'product_id' => $productId,
                        'category_id' => $newCat->id,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }

            // Remove old category assignments
            DB::table('category_product')
                ->where('category_id', $oldCat->id)
                ->delete();
        }

        // Step 3: Remove products from deleted categories
        foreach (self::DELETE_SLUGS as $slug) {
            $cat = DB::table('categories')->where('slug', $slug)->first();
            if ($cat) {
                DB::table('category_product')
                    ->where('category_id', $cat->id)
                    ->delete();
            }
        }

        // Step 4: Delete old categories that are no longer needed
        $targetSlugs = array_keys(self::TARGET_CATEGORIES);
        $oldSlugs = array_merge(array_keys(self::SLUG_MAP), self::DELETE_SLUGS);
        $toDelete = array_diff($oldSlugs, $targetSlugs);

        if (! empty($toDelete)) {
            DB::table('categories')
                ->whereIn('slug', $toDelete)
                ->delete();
        }
    }

    public function down(): void
    {
        // This migration is not safely reversible since product reassignments
        // lose the original category info. To restore, re-run seeders.
    }
};
