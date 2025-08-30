<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Producer;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first producer (created in ProducerSeeder)
        $producer = Producer::first();
        
        if (!$producer) {
            $this->command->warn('No producers found. Skipping product seeding.');
            return;
        }
        
        // Get categories for assignment
        $vegetables = Category::where('slug', 'vegetables')->first();
        $fruits = Category::where('slug', 'fruits')->first();
        $oliveOil = Category::where('slug', 'olive-oil-olives')->first();
        $herbs = Category::where('slug', 'herbs-spices')->first();
        
        // Create products with categories and images
        $productsData = [
            [
                'product_data' => [
                    'producer_id' => $producer->id,
                    'name' => 'Organic Tomatoes',
                    'slug' => 'organic-tomatoes',
                    'description' => 'Fresh organic tomatoes grown without pesticides',
                    'price' => 3.50,
                    'weight_per_unit' => 1.000,
                    'unit' => 'kg',
                    'stock' => 100,
                    'category' => 'Vegetables',
                    'is_organic' => true,
                    'image_url' => 'https://images.unsplash.com/photo-1592841200221-a6898f307baa',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$vegetables],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1592841200221-a6898f307baa', 'is_primary' => true, 'sort_order' => 0],
                    ['url' => 'https://images.unsplash.com/photo-1546470427-a465b4e8c3c8', 'is_primary' => false, 'sort_order' => 1],
                ]
            ],
            [
                'product_data' => [
                    'producer_id' => $producer->id,
                    'name' => 'Fresh Lettuce',
                    'slug' => 'fresh-lettuce',
                    'description' => 'Crispy fresh lettuce perfect for salads',
                    'price' => 2.25,
                    'weight_per_unit' => 0.300,
                    'unit' => 'piece',
                    'stock' => 50,
                    'category' => 'Vegetables',
                    'is_organic' => false,
                    'image_url' => 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$vegetables],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1', 'is_primary' => true, 'sort_order' => 0],
                ]
            ],
            [
                'product_data' => [
                    'producer_id' => $producer->id,
                    'name' => 'Extra Virgin Olive Oil',
                    'slug' => 'extra-virgin-olive-oil',
                    'description' => 'Premium Greek olive oil from Crete',
                    'price' => 12.00,
                    'weight_per_unit' => 0.500,
                    'unit' => 'bottle',
                    'stock' => 25,
                    'category' => 'Oil',
                    'is_organic' => true,
                    'image_url' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$oliveOil],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5', 'is_primary' => true, 'sort_order' => 0],
                    ['url' => 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d', 'is_primary' => false, 'sort_order' => 1],
                ]
            ],
            [
                'product_data' => [
                    'producer_id' => $producer->id,
                    'name' => 'Fresh Apples',
                    'slug' => 'fresh-apples',
                    'description' => 'Crispy red apples from local orchards',
                    'price' => 4.00,
                    'weight_per_unit' => 1.000,
                    'unit' => 'kg',
                    'stock' => 75,
                    'category' => 'Fruits',
                    'is_organic' => false,
                    'image_url' => 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
                    'status' => 'available',
                    'is_active' => false, // Mix of active/inactive
                ],
                'categories' => [$fruits],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', 'is_primary' => true, 'sort_order' => 0],
                ]
            ],
            [
                'product_data' => [
                    'producer_id' => $producer->id,
                    'name' => 'Greek Oregano',
                    'slug' => 'greek-oregano',
                    'description' => 'Aromatic Greek oregano, dried and packaged',
                    'price' => 5.50,
                    'weight_per_unit' => 0.050,
                    'unit' => 'packet',
                    'stock' => 30,
                    'category' => 'Herbs',
                    'is_organic' => true,
                    'image_url' => 'https://images.unsplash.com/photo-1629978452215-6ab392d7abb9',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$herbs],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1629978452215-6ab392d7abb9', 'is_primary' => true, 'sort_order' => 0],
                ]
            ],
        ];

        foreach ($productsData as $item) {
            $productData = $item['product_data'];
            $categories = array_filter($item['categories']); // Remove null categories
            $images = $item['images'];

            // Create product if it doesn't exist
            $product = Product::firstOrCreate(
                ['slug' => $productData['slug']],
                $productData
            );

            // Attach categories
            if (!empty($categories)) {
                $product->categories()->sync(collect($categories)->pluck('id')->toArray());
            }

            // Create images
            foreach ($images as $imageData) {
                ProductImage::firstOrCreate([
                    'product_id' => $product->id,
                    'url' => $imageData['url']
                ], [
                    'product_id' => $product->id,
                    'url' => $imageData['url'],
                    'is_primary' => $imageData['is_primary'],
                    'sort_order' => $imageData['sort_order']
                ]);
            }
        }
    }
}
