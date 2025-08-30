<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Str;

class E2ESeeder extends Seeder
{
    /**
     * Seed deterministic test data for E2E tests
     */
    public function run(): void
    {
        // Create test user for E2E
        $e2eUser = User::firstOrCreate(
            ['email' => 'e2e@example.com'],
            [
                'name' => 'E2E Test User',
                'email' => 'e2e@example.com',
                'role' => 'consumer',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create E2E producer if needed
        $e2eProducer = Producer::firstOrCreate(
            ['slug' => 'e2e-test-producer'],
            [
                'user_id' => $e2eUser->id,
                'name' => 'E2E Test Producer',
                'business_name' => 'E2E Test Farm',
                'slug' => 'e2e-test-producer',
                'description' => 'Test producer for E2E testing',
                'location' => 'Test Location',
                'is_active' => true,
            ]
        );

        // Create 3 deterministic categories
        $categories = [];
        $categoryData = [
            ['name' => 'E2E Vegetables', 'slug' => 'e2e-vegetables'],
            ['name' => 'E2E Fruits', 'slug' => 'e2e-fruits'],
            ['name' => 'E2E Herbs', 'slug' => 'e2e-herbs'],
        ];

        foreach ($categoryData as $catData) {
            $categories[$catData['slug']] = Category::firstOrCreate(
                ['slug' => $catData['slug']],
                $catData
            );
        }

        // Create 8 deterministic products (mix of English and Greek for E2E testing)
        $productsData = [
            [
                'name' => 'E2E Test Tomatoes',
                'slug' => 'e2e-test-tomatoes',
                'description' => 'Fresh test tomatoes for E2E testing',
                'price' => 3.99,
                'unit' => 'kg',
                'stock' => 100,
                'category' => 'e2e-vegetables',
                'image_url' => 'https://images.unsplash.com/photo-1592841200221-a6898f307baa',
            ],
            [
                'name' => 'E2E Test Lettuce',
                'slug' => 'e2e-test-lettuce',
                'description' => 'Crispy test lettuce for E2E testing',
                'price' => 2.50,
                'unit' => 'piece',
                'stock' => 50,
                'category' => 'e2e-vegetables',
                'image_url' => 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1',
            ],
            [
                'name' => 'E2E Test Apples',
                'slug' => 'e2e-test-apples',
                'description' => 'Sweet test apples for E2E testing',
                'price' => 4.25,
                'unit' => 'kg',
                'stock' => 75,
                'category' => 'e2e-fruits',
                'image_url' => 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
            ],
            [
                'name' => 'Πορτοκάλια E2E Test',
                'slug' => 'portokalia-e2e-test',
                'description' => 'Φρέσκα πορτοκάλια για E2E δοκιμές',
                'price' => 3.75,
                'unit' => 'kg',
                'stock' => 60,
                'category' => 'e2e-fruits',
                'image_url' => 'https://images.unsplash.com/photo-1547514701-42782101795e',
            ],
            [
                'name' => 'E2E Test Oranges',
                'slug' => 'e2e-test-oranges',
                'description' => 'Juicy test oranges for E2E testing',
                'price' => 3.75,
                'unit' => 'kg',
                'stock' => 60,
                'category' => 'e2e-fruits',
                'image_url' => 'https://images.unsplash.com/photo-1547514701-42782101795e',
            ],
            [
                'name' => 'E2E Test Oregano',
                'slug' => 'e2e-test-oregano',
                'description' => 'Aromatic test oregano for E2E testing',
                'price' => 5.99,
                'unit' => 'packet',
                'stock' => 25,
                'category' => 'e2e-herbs',
                'image_url' => 'https://images.unsplash.com/photo-1629978452215-6ab392d7abb9',
            ],
            [
                'name' => 'E2E Test Basil',
                'slug' => 'e2e-test-basil',
                'description' => 'Fresh test basil for E2E testing',
                'price' => 4.50,
                'unit' => 'packet',
                'stock' => 30,
                'category' => 'e2e-herbs',
                'image_url' => 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c',
            ],
            [
                'name' => 'Ελληνικό Βασιλικό',
                'slug' => 'elliniko-vasiliko',
                'description' => 'Αρωματικό βασιλικό για E2E δοκιμές',
                'price' => 4.50,
                'unit' => 'packet',
                'stock' => 30,
                'category' => 'e2e-herbs',
                'image_url' => 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c',
            ],
        ];

        foreach ($productsData as $productData) {
            $category = $categories[$productData['category']];
            
            $product = Product::firstOrCreate(
                ['slug' => $productData['slug']],
                [
                    'producer_id' => $e2eProducer->id,
                    'name' => $productData['name'],
                    'slug' => $productData['slug'],
                    'description' => $productData['description'],
                    'price' => $productData['price'],
                    'unit' => $productData['unit'],
                    'stock' => $productData['stock'],
                    'is_active' => true,
                    'weight_per_unit' => 1.000,
                    'is_organic' => false,
                    'status' => 'available',
                ]
            );

            // Attach category
            $product->categories()->sync([$category->id]);

            // Create product image
            ProductImage::firstOrCreate([
                'product_id' => $product->id,
                'url' => $productData['image_url']
            ], [
                'product_id' => $product->id,
                'url' => $productData['image_url'],
                'is_primary' => true,
                'sort_order' => 0
            ]);
        }

        echo "✅ E2E Seeder: Created 1 user, 3 categories, 8 products (including Greek products)\n";
    }
}