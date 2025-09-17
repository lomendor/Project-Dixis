<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

#[Group('mvp')]
class PublicProductShowTest extends TestCase
{
    use RefreshDatabase;

    protected $product;

    protected $category;

    protected $image;

    protected function setUp(): void
    {
        parent::setUp();

        // Create producer and category
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);
        $this->category = Category::create(['name' => 'Vegetables', 'slug' => 'vegetables']);

        // Create active product
        $this->product = Product::factory()->create([
            'name' => 'Organic Tomatoes',
            'description' => 'Fresh organic tomatoes from local farm',
            'price' => 3.50,
            'producer_id' => $producer->id,
            'is_active' => true,
        ]);

        // Attach category
        $this->product->categories()->attach($this->category->id);

        // Create images (primary and secondary)
        $this->image = ProductImage::create([
            'product_id' => $this->product->id,
            'url' => 'https://example.com/tomatoes-primary.jpg',
            'is_primary' => true,
            'sort_order' => 0,
        ]);

        ProductImage::create([
            'product_id' => $this->product->id,
            'url' => 'https://example.com/tomatoes-secondary.jpg',
            'is_primary' => false,
            'sort_order' => 1,
        ]);
    }

    public function test_show_returns_product_with_categories_and_images(): void
    {
        $response = $this->get("/api/v1/public/products/{$this->product->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'description',
                'price',
                'categories' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                    ],
                ],
                'images' => [
                    '*' => [
                        'id',
                        'url',
                        'is_primary',
                        'sort_order',
                    ],
                ],
                'producer' => [
                    'id',
                    'name',
                ],
            ])
            ->assertJson([
                'id' => $this->product->id,
                'name' => 'Organic Tomatoes',
                'price' => '3.50',
            ]);
    }

    public function test_show_returns_images_with_primary_first(): void
    {
        $response = $this->get("/api/v1/public/products/{$this->product->id}");

        $response->assertStatus(200);

        $images = $response->json('images');
        $this->assertCount(2, $images);

        // First image should be primary
        $this->assertTrue($images[0]['is_primary']);
        $this->assertFalse($images[1]['is_primary']);

        // Check sort order
        $this->assertEquals(0, $images[0]['sort_order']);
        $this->assertEquals(1, $images[1]['sort_order']);
    }

    public function test_show_returns_attached_categories(): void
    {
        $response = $this->get("/api/v1/public/products/{$this->product->id}");

        $response->assertStatus(200);

        $categories = $response->json('categories');
        $this->assertCount(1, $categories);
        $this->assertEquals('Vegetables', $categories[0]['name']);
        $this->assertEquals('vegetables', $categories[0]['slug']);
        $this->assertEquals($this->category->id, $categories[0]['id']);
    }

    public function test_show_returns_producer_information(): void
    {
        $response = $this->get("/api/v1/public/products/{$this->product->id}");

        $response->assertStatus(200);

        $producer = $response->json('producer');
        $this->assertNotNull($producer);
        $this->assertArrayHasKey('id', $producer);
        $this->assertArrayHasKey('name', $producer);
        $this->assertEquals($this->product->producer_id, $producer['id']);
    }

    public function test_show_returns_404_for_inactive_product(): void
    {
        // Create inactive product
        $user = User::factory()->create(['role' => 'producer']);
        $producer = Producer::factory()->create(['user_id' => $user->id]);
        $inactiveProduct = Product::factory()->create([
            'producer_id' => $producer->id,
            'is_active' => false,
        ]);

        $response = $this->get("/api/v1/public/products/{$inactiveProduct->id}");

        $response->assertStatus(404);
    }

    public function test_show_returns_404_for_nonexistent_product(): void
    {
        $response = $this->get('/api/v1/public/products/99999');

        $response->assertStatus(404);
    }

    public function test_show_product_includes_all_required_fields(): void
    {
        $response = $this->get("/api/v1/public/products/{$this->product->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'description',
                'price',
                'unit',
                'stock',
                'is_active',
                'categories',
                'images',
                'producer',
                'created_at',
                'updated_at',
            ]);
    }
}
