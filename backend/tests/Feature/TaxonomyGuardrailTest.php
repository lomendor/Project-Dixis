<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Producer;
use Database\Seeders\CategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Guardrail tests for category/product taxonomy consistency.
 *
 * Ensures:
 * - All expected categories exist with correct slugs
 * - Products reference valid categories
 * - No orphaned category references
 *
 * @see Issue #2553 for background
 */
class TaxonomyGuardrailTest extends TestCase
{
    use RefreshDatabase;

    /**
     * The canonical category slugs created by CategorySeeder.
     * Any code referencing categories should use these exact slugs.
     */
    private const CANONICAL_CATEGORY_SLUGS = [
        'fruits',
        'vegetables',
        'herbs-spices',
        'grains-cereals',
        'dairy-products',
        'olive-oil-olives',
        'wine-beverages',
        'honey-preserves',
    ];

    /**
     * Test that CategorySeeder creates all expected categories.
     */
    public function test_category_seeder_creates_all_expected_categories(): void
    {
        // Run the seeder
        $this->seed(CategorySeeder::class);

        // Verify all canonical categories exist
        foreach (self::CANONICAL_CATEGORY_SLUGS as $slug) {
            $this->assertDatabaseHas('categories', [
                'slug' => $slug,
            ], "Category with slug '{$slug}' should exist");
        }

        // Verify count matches
        $this->assertEquals(
            count(self::CANONICAL_CATEGORY_SLUGS),
            Category::count(),
            'CategorySeeder should create exactly '.count(self::CANONICAL_CATEGORY_SLUGS).' categories'
        );
    }

    /**
     * Test that category slugs are generated correctly from names.
     */
    public function test_category_slug_generation_is_consistent(): void
    {
        $expectedMappings = [
            'Fruits' => 'fruits',
            'Vegetables' => 'vegetables',
            'Herbs & Spices' => 'herbs-spices',
            'Grains & Cereals' => 'grains-cereals',
            'Dairy Products' => 'dairy-products',
            'Olive Oil & Olives' => 'olive-oil-olives',
            'Wine & Beverages' => 'wine-beverages',
            'Honey & Preserves' => 'honey-preserves',
        ];

        foreach ($expectedMappings as $name => $expectedSlug) {
            $this->assertEquals(
                $expectedSlug,
                Str::slug($name),
                "Str::slug('{$name}') should produce '{$expectedSlug}'"
            );
        }
    }

    /**
     * Test that products can be associated with categories via many-to-many.
     */
    public function test_product_category_relationship_works(): void
    {
        $this->seed(CategorySeeder::class);

        $producer = Producer::factory()->create();
        $product = Product::factory()->create(['producer_id' => $producer->id]);

        $vegetables = Category::where('slug', 'vegetables')->first();
        $fruits = Category::where('slug', 'fruits')->first();

        // Attach categories
        $product->categories()->attach([$vegetables->id, $fruits->id]);

        // Reload and verify
        $product->refresh();
        $this->assertCount(2, $product->categories);
        $this->assertTrue($product->categories->contains('slug', 'vegetables'));
        $this->assertTrue($product->categories->contains('slug', 'fruits'));
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

        $vegetables = Category::where('slug', 'vegetables')->first();

        // Attach products to category
        $vegetables->products()->attach([$product1->id, $product2->id]);

        // Reload and verify
        $vegetables->refresh();
        $this->assertCount(2, $vegetables->products);
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
        // Run seeder twice
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
     * This test documents the exact slugs that ProductSeeder and other
     * code should use when looking up categories.
     */
    public function test_known_category_slug_lookups(): void
    {
        $this->seed(CategorySeeder::class);

        // All canonical slugs used in ProductSeeder - verify they exist
        $this->assertNotNull(
            Category::where('slug', 'vegetables')->first(),
            "Category 'vegetables' should exist"
        );
        $this->assertNotNull(
            Category::where('slug', 'fruits')->first(),
            "Category 'fruits' should exist"
        );
        $this->assertNotNull(
            Category::where('slug', 'olive-oil-olives')->first(),
            "Category 'olive-oil-olives' should exist"
        );
        $this->assertNotNull(
            Category::where('slug', 'herbs-spices')->first(),
            "Category 'herbs-spices' should exist"
        );
        $this->assertNotNull(
            Category::where('slug', 'dairy-products')->first(),
            "Category 'dairy-products' should exist"
        );
        $this->assertNotNull(
            Category::where('slug', 'honey-preserves')->first(),
            "Category 'honey-preserves' should exist"
        );

        // Guard against common typo slugs that would silently fail
        // (these would return NULL and cause products to have no category)
        $this->assertNull(
            Category::where('slug', 'dairy')->first(),
            "Category 'dairy' should NOT exist (use 'dairy-products' instead)"
        );
        $this->assertNull(
            Category::where('slug', 'honey')->first(),
            "Category 'honey' should NOT exist (use 'honey-preserves' instead)"
        );
        $this->assertNull(
            Category::where('slug', 'herbs')->first(),
            "Category 'herbs' should NOT exist (use 'herbs-spices' instead)"
        );
        $this->assertNull(
            Category::where('slug', 'oil')->first(),
            "Category 'oil' should NOT exist (use 'olive-oil-olives' instead)"
        );
    }
}
