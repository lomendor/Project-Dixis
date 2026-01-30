<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Distributes products across multiple producers for realistic testing.
     */
    public function run(): void
    {
        // Get all producers (created in ProducerSeeder)
        $producers = Producer::all();

        if ($producers->isEmpty()) {
            $this->command->warn('No producers found. Skipping product seeding.');

            return;
        }

        // Get categories for assignment
        $vegetables = Category::where('slug', 'vegetables')->first();
        $fruits = Category::where('slug', 'fruits')->first();
        $oliveOil = Category::where('slug', 'olive-oil-olives')->first();
        $herbs = Category::where('slug', 'herbs-spices')->first();
        $dairy = Category::where('slug', 'dairy')->first();
        $honey = Category::where('slug', 'honey')->first();

        // Get producers by slug for explicit assignment, with fallbacks
        $greenFarm = $producers->firstWhere('slug', 'green-farm-co') ?? $producers->first();
        $cretanHoney = $producers->firstWhere('slug', 'cretan-honey') ?? $producers->skip(1)->first() ?? $greenFarm;
        $olympusDairy = $producers->firstWhere('slug', 'mount-olympus-dairy') ?? $producers->skip(2)->first() ?? $greenFarm;

        // Create products distributed across producers
        $productsData = [
            // GREEN FARM CO. products (vegetables, herbs)
            [
                'product_data' => [
                    'producer_id' => $greenFarm->id,
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
                ],
            ],
            [
                'product_data' => [
                    'producer_id' => $greenFarm->id,
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
                ],
            ],
            [
                'product_data' => [
                    'producer_id' => $greenFarm->id,
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
                ],
            ],
            // CRETAN HONEY products (oil, honey)
            [
                'product_data' => [
                    'producer_id' => $cretanHoney->id,
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
                ],
            ],
            [
                'product_data' => [
                    'producer_id' => $cretanHoney->id,
                    'name' => 'Cretan Thyme Honey',
                    'slug' => 'cretan-thyme-honey',
                    'description' => 'Pure thyme honey from the mountains of Crete',
                    'price' => 15.00,
                    'weight_per_unit' => 0.500,
                    'unit' => 'jar',
                    'stock' => 40,
                    'category' => 'Honey',
                    'is_organic' => true,
                    'image_url' => 'https://images.unsplash.com/photo-1587049352846-4a222e784d38',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$honey ?? $oliveOil],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1587049352846-4a222e784d38', 'is_primary' => true, 'sort_order' => 0],
                ],
            ],
            // MOUNT OLYMPUS DAIRY products (fruits, dairy)
            [
                'product_data' => [
                    'producer_id' => $olympusDairy->id,
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
                    'is_active' => true,
                ],
                'categories' => [$fruits],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', 'is_primary' => true, 'sort_order' => 0],
                ],
            ],
            [
                'product_data' => [
                    'producer_id' => $olympusDairy->id,
                    'name' => 'Greek Feta Cheese',
                    'slug' => 'greek-feta-cheese',
                    'description' => 'Traditional PDO feta cheese from Thessaly',
                    'price' => 8.50,
                    'weight_per_unit' => 0.400,
                    'unit' => 'piece',
                    'stock' => 60,
                    'category' => 'Dairy',
                    'is_organic' => false,
                    'image_url' => 'https://images.unsplash.com/photo-1626957341926-98752fc2ba90',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$dairy ?? $vegetables],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1626957341926-98752fc2ba90', 'is_primary' => true, 'sort_order' => 0],
                ],
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
            if (! empty($categories)) {
                $product->categories()->sync(collect($categories)->pluck('id')->toArray());
            }

            // Create images
            foreach ($images as $imageData) {
                ProductImage::firstOrCreate([
                    'product_id' => $product->id,
                    'url' => $imageData['url'],
                ], [
                    'product_id' => $product->id,
                    'url' => $imageData['url'],
                    'is_primary' => $imageData['is_primary'],
                    'sort_order' => $imageData['sort_order'],
                ]);
            }
        }
    }
}
