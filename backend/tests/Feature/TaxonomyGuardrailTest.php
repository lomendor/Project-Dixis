<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Producer;
use Database\Seeders\CategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Guardrail tests for category/product taxonomy consistency.
 *
 * Phase 10: Definitive 10 locker-compatible categories.
 *
 * Ensures:
 * - All 10 expected categories exist with correct slugs
 * - Products reference valid categories
 * - No orphaned category references
 *
 * @see Issue #2553 for background
 */
class TaxonomyGuardrailTest extends TestCase
{
    use RefreshDatabase;

    /**
     * The canonical 10 category slugs created by CategorySeeder.
     * Any code referencing categories should use these exact slugs.
     */
    private const CANONICAL_CATEGORY_SLUGS = [
        'olive-oil-olives',
        'honey-bee',
        'nuts-dried',
        'cosmetics',
        'beverages',
        'sweets-jams',
        'pasta',
        'herbs-spices-tea',
        'sauces-spreads',
        'legumes-grains',
    ];

    /**
     * Test that CategorySeeder creates all 10 expected categories.
     */
    public function test_category_seeder_creates_all_expected_categories(): void
    {
        $this->seed(CategorySeeder::class);

        foreach (self::CANONICAL_CATEGORY_SLUGS as $slug) {
            $this->assertDatabaseHas('categories', [
                'slug' => $slug,
            ]);
        }

        $this->assertEquals(
            count(self::CANONICAL_CATEGORY_SLUGS),
            Category::count(),
            'CategorySeeder should create exactly '.count(self::CANONICAL_CATEGORY_SLUGS).' categories'
        );
    }

    /**
     * Test that products can be associated with categories via many-to-many.
     */
    public function test_product_category_relationship_works(): void
    {
        $this->seed(CategorySeeder::class);

        $producer = Producer::factory()->create();
        $product = Product::factory()->create(['producer_id' => $producer->id]);

        $oliveOil = Category::where('slug', 'olive-oil-olives')->first();
        $honey = Category::where('slug', 'honey-bee')->first();

        $product->categories()->attach([$oliveOil->id, $honey->id]);

        $product->refresh();
        $this->assertCount(2, $product->categories);
        $this->assertTrue($product->categories->contains('slug', 'olive-oil-olives'));
        $this->assertTrue($product->categories->contains('slug', 'honey-bee'));
    }

    /**
     * Test that category->products relationship works.
     */
    public function test_category_products_relationship_works(): void
    {
        $this->seed(CategorySeeder::class);

        $producer = Producer::factory()->create();
        $product1 = Product::factory()->create(['producer_id' => $producer->id]);
        $product2 = Product::factory()->create(['producer_id' => $producer->id]);

        $pasta = Category::where('slug', 'pasta')->first();

        $pasta->products()->attach([$product1->id, $product2->id]);

        $pasta->refresh();
        $this->assertCount(2, $pasta->products);
    }

    /**
     * Test that category slugs are unique.
     */
    public function test_category_slugs_are_unique(): void
    {
        $this->seed(CategorySeeder::class);

        $slugs = Category::pluck('slug')->toArray();
        $uniqueSlugs = array_unique($slugs);

        $this->assertCount(
            count($slugs),
            $uniqueSlugs,
            'All category slugs should be unique'
        );
    }

    /**
     * Test that seeder is idempotent (can be run multiple times safely).
     */
    public function test_category_seeder_is_idempotent(): void
    {
        $this->seed(CategorySeeder::class);
        $countAfterFirst = Category::count();

        $this->seed(CategorySeeder::class);
        $countAfterSecond = Category::count();

        $this->assertEquals(
            $countAfterFirst,
            $countAfterSecond,
            'Running CategorySeeder twice should not duplicate categories'
        );
    }

    /**
     * Test lookup by known slugs works (guard against typos in code).
     *
     * Documents the exact slugs that GreekProductSeeder and other
     * code should use when looking up categories.
     */
    public function test_known_category_slug_lookups(): void
    {
        $this->seed(CategorySeeder::class);

        // All 10 canonical slugs must exist
        foreach (self::CANONICAL_CATEGORY_SLUGS as $slug) {
            $this->assertNotNull(
                Category::where('slug', $slug)->first(),
                "Category '{$slug}' should exist"
            );
        }

        // Guard against legacy slugs that would silently fail
        $legacySlugs = [
            'fruits',
            'vegetables',
            'dairy-products',
            'wine-beverages',
            'honey-preserves',
            'herbs-spices',
            'grains-cereals',
            'pasta-trahanas',
            'flours-bakery',
            'nuts-dried-fruits',
            'sweets-preserves',
            'sauces-pickles',
        ];

        foreach ($legacySlugs as $legacy) {
            $this->assertNull(
                Category::where('slug', $legacy)->first(),
                "Legacy category '{$legacy}' should NOT exist"
            );
        }
    }
}
