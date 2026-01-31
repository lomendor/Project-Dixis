<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class GreekProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first producer (created in ProducerSeeder)
        $producer = Producer::first();

        if (! $producer) {
            $this->command->warn('No producers found. Skipping Greek product seeding.');

            return;
        }

        // Get categories for assignment (use canonical slugs from CategorySeeder)
        $vegetables = Category::where('slug', 'vegetables')->first();
        $fruits = Category::where('slug', 'fruits')->first();
        $oliveOil = Category::where('slug', 'olive-oil-olives')->first();
        $herbs = Category::where('slug', 'herbs-spices')->first();
        $dairy = Category::where('slug', 'dairy-products')->first();
        $honey = Category::where('slug', 'honey-preserves')->first();

        // Create Greek products for testing Greek normalization
        $greekProductsData = [
            [
                'product_data' => [
                    'producer_id' => $producer->id,
                    'name' => 'Πορτοκάλια Κρήτης',
                    'slug' => 'portokalia-kritis',
                    'description' => 'Φρέσκα πορτοκάλια από την Κρήτη, γλυκά και ζουμερά',
                    'price' => 2.80,
                    'weight_per_unit' => 1.000,
                    'unit' => 'kg',
                    'stock' => 120,
                    'category' => 'Fruits',
                    'is_organic' => true,
                    'image_url' => 'https://images.unsplash.com/photo-1547036967-23d11aacaee0',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$fruits],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1547036967-23d11aacaee0', 'is_primary' => true, 'sort_order' => 0],
                ],
            ],
            [
                'product_data' => [
                    'producer_id' => $producer->id,
                    'name' => 'Ελαιόλαδο Καλαμάτας',
                    'slug' => 'elaiola-kalamatas',
                    'description' => 'Παρθένο ελαιόλαδο από Καλαμάτα, εξαιρετικής ποιότητας',
                    'price' => 15.50,
                    'weight_per_unit' => 0.750,
                    'unit' => 'bottle',
                    'stock' => 45,
                    'category' => 'Oil',
                    'is_organic' => true,
                    'image_url' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$oliveOil],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5', 'is_primary' => true, 'sort_order' => 0],
                ],
            ],
            [
                'product_data' => [
                    'producer_id' => $producer->id,
                    'name' => 'Μήλα Ζαγοράς',
                    'slug' => 'mila-zagoras',
                    'description' => 'Κόκκινα μήλα από την Ζαγορά Πηλίου, τραγανά και νόστιμα',
                    'price' => 3.20,
                    'weight_per_unit' => 1.000,
                    'unit' => 'kg',
                    'stock' => 80,
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
                    'producer_id' => $producer->id,
                    'name' => 'Ντομάτες Σαντορίνης',
                    'slug' => 'domatez-santorinis',
                    'description' => 'Μικρές ντομάτες από Σαντορίνη, γλυκές και αρωματικές',
                    'price' => 4.50,
                    'weight_per_unit' => 0.500,
                    'unit' => 'kg',
                    'stock' => 60,
                    'category' => 'Vegetables',
                    'is_organic' => true,
                    'image_url' => 'https://images.unsplash.com/photo-1592841200221-a6898f307baa',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$vegetables],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1592841200221-a6898f307baa', 'is_primary' => true, 'sort_order' => 0],
                ],
            ],
            [
                'product_data' => [
                    'producer_id' => $producer->id,
                    'name' => 'Μέλι Θυμαρίσιο',
                    'slug' => 'meli-thymarisio',
                    'description' => 'Θυμαρίσιο μέλι από τα βουνά της Κρήτης, πυκνό και αρωματικό',
                    'price' => 8.90,
                    'weight_per_unit' => 0.450,
                    'unit' => 'jar',
                    'stock' => 35,
                    'category' => 'Honey',
                    'is_organic' => true,
                    'image_url' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$honey ?? $herbs],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62', 'is_primary' => true, 'sort_order' => 0],
                ],
            ],
            [
                'product_data' => [
                    'producer_id' => $producer->id,
                    'name' => 'Φέτα ΠΟΠ',
                    'slug' => 'feta-pop',
                    'description' => 'Αυθεντική φέτα ΠΟΠ από πρόβειο και κατσικίσιο γάλα',
                    'price' => 6.80,
                    'weight_per_unit' => 0.400,
                    'unit' => 'piece',
                    'stock' => 25,
                    'category' => 'Dairy',
                    'is_organic' => false,
                    'image_url' => 'https://images.unsplash.com/photo-1559561853-08451507cbe7',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$dairy ?? $vegetables],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1559561853-08451507cbe7', 'is_primary' => true, 'sort_order' => 0],
                ],
            ],
        ];

        foreach ($greekProductsData as $item) {
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

        $this->command->info('Greek products seeded successfully!');
    }
}
