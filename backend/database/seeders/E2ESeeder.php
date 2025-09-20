<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Database\Seeder;

class E2ESeeder extends Seeder
{
    /**
     * Seed deterministic test data for E2E tests
     */
    public function run(): void
    {
        // Create deterministic test users for E2E (in testing and local environments)
        if (app()->environment(['testing', 'local'])) {

            // Test consumer user
            $testUser = User::firstOrCreate(
                ['email' => 'test@dixis.local'],
                [
                    'name' => 'Test User',
                    'email' => 'test@dixis.local',
                    'role' => 'consumer',
                    'password' => bcrypt('Passw0rd!'),
                    'email_verified_at' => now(),
                ]
            );

            // Test producer user
            $testProducerUser = User::firstOrCreate(
                ['email' => 'producer@dixis.local'],
                [
                    'name' => 'Test Producer User',
                    'email' => 'producer@dixis.local',
                    'role' => 'producer',
                    'password' => bcrypt('Passw0rd!'),
                    'email_verified_at' => now(),
                ]
            );

            echo "🔐 E2E Test Users Created:\n";
            echo "   Consumer: test@dixis.local / Passw0rd!\n";
            echo "   Producer: producer@dixis.local / Passw0rd!\n";
        }

        // Create legacy test user for backwards compatibility
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

        // Create 3 core deterministic products for E2E search testing (minimal set)
        $productsData = [
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
                'url' => $productData['image_url'],
            ], [
                'product_id' => $product->id,
                'url' => $productData['image_url'],
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }

        echo "✅ E2E Seeder: Created deterministic users, 3 categories, 3 products (Greek & English for search)\n";
    }
}
