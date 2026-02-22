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

        // Get categories for assignment (Phase 10: unified slugs)
        $legumeGrains = Category::where('slug', 'legumes-grains')->first();
        $oliveOil = Category::where('slug', 'olive-oil-olives')->first();
        $herbsTea = Category::where('slug', 'herbs-spices-tea')->first();
        $nutsDried = Category::where('slug', 'nuts-dried')->first();
        $honey = Category::where('slug', 'honey-bee')->first();
        $pasta = Category::where('slug', 'pasta')->first();
        $sauces = Category::where('slug', 'sauces-spreads')->first();
        $sweets = Category::where('slug', 'sweets-jams')->first();

        // Get producers by slug for explicit assignment, with fallbacks
        $ktima = $producers->firstWhere('slug', 'ktima-papadopoulou') ?? $producers->firstWhere('slug', 'green-farm-co') ?? $producers->first();
        $melissa = $producers->firstWhere('slug', 'melissokomia-kritis') ?? $producers->firstWhere('slug', 'cretan-honey') ?? $producers->skip(1)->first() ?? $ktima;
        $galakto = $producers->firstWhere('slug', 'galaktokomika-olympou') ?? $producers->firstWhere('slug', 'mount-olympus-dairy') ?? $producers->skip(2)->first() ?? $ktima;

        // Create products distributed across producers
        $productsData = [
            // ΚΤΗΜΑ ΠΑΠΑΔΟΠΟΥΛΟΥ — όσπρια, ζυμαρικά, βότανα
            [
                'product_data' => [
                    'producer_id' => $ktima->id,
                    'name' => 'Φακές Εγχώριες 500g',
                    'slug' => 'fakes-egchories-500g',
                    'description' => 'Εγχώριες φακές ψιλές, ιδανικές για σούπα και σαλάτα. Πλούσιες σε πρωτεΐνη και σίδηρο.',
                    'price' => 4.20,
                    'weight_per_unit' => 500,
                    'unit' => 'συσκευασία',
                    'stock' => 100,
                    'category' => 'Legumes',
                    'image_url' => 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$legumeGrains],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082', 'is_primary' => true, 'sort_order' => 0],
                ],
            ],
            [
                'product_data' => [
                    'producer_id' => $ktima->id,
                    'name' => 'Χυλοπίτες Σπιτικές 500g',
                    'slug' => 'chilopites-spitikes-500g',
                    'description' => 'Σπιτικές χυλοπίτες με αυγά ελευθέρας βοσκής και σιμιγδάλι. Παραδοσιακή συνταγή από τη Μεσσηνία.',
                    'price' => 5.90,
                    'weight_per_unit' => 500,
                    'unit' => 'συσκευασία',
                    'stock' => 50,
                    'category' => 'Pasta',
                    'image_url' => 'https://images.unsplash.com/photo-1551462147-ff29053bfc14',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$pasta],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1551462147-ff29053bfc14', 'is_primary' => true, 'sort_order' => 0],
                ],
            ],
            [
                'product_data' => [
                    'producer_id' => $ktima->id,
                    'name' => 'Ρίγανη Βουνού 100g',
                    'slug' => 'rigani-vounou-100g',
                    'description' => 'Αρωματική ελληνική ρίγανη βουνού, αποξηραμένη με τον παραδοσιακό τρόπο. Ιδανική για σαλάτες και ψητά.',
                    'price' => 3.50,
                    'weight_per_unit' => 100,
                    'unit' => 'συσκευασία',
                    'stock' => 80,
                    'category' => 'Herbs',
                    'image_url' => 'https://images.unsplash.com/photo-1629978452215-6ab392d7abb9',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$herbsTea],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1629978452215-6ab392d7abb9', 'is_primary' => true, 'sort_order' => 0],
                ],
            ],
            // ΜΕΛΙΣΣΟΚΟΜΙΑ ΚΡΗΤΗΣ — ελαιόλαδο, μέλι
            [
                'product_data' => [
                    'producer_id' => $melissa->id,
                    'name' => 'Εξαιρετικό Παρθένο Ελαιόλαδο 500ml',
                    'slug' => 'exairetiko-partheno-elaiolado-500ml',
                    'description' => 'Premium ελαιόλαδο εξαιρετικό παρθένο από βιολογικούς ελαιώνες της Κρήτης. Χαμηλή οξύτητα, πλούσια γεύση.',
                    'price' => 12.00,
                    'weight_per_unit' => 500,
                    'unit' => 'φιάλη',
                    'stock' => 25,
                    'category' => 'Oil',
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
                    'producer_id' => $melissa->id,
                    'name' => 'Θυμαρίσιο Μέλι Κρήτης 450g',
                    'slug' => 'thymarisio-meli-kritis-450g',
                    'description' => 'Αγνό θυμαρίσιο μέλι από τα βουνά της Κρήτης. Συλλέγεται χειροποίητα από τα μελίσσια μας σε υψόμετρο 800μ.',
                    'price' => 15.00,
                    'weight_per_unit' => 450,
                    'unit' => 'βάζο',
                    'stock' => 40,
                    'category' => 'Honey',
                    'image_url' => 'https://images.unsplash.com/photo-1587049352846-4a222e784d38',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$honey],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1587049352846-4a222e784d38', 'is_primary' => true, 'sort_order' => 0],
                ],
            ],
            // ΓΑΛΑΚΤΟΚΟΜΙΚΑ ΟΛΥΜΠΟΥ — σάλτσες, ζυμαρικά
            [
                'product_data' => [
                    'producer_id' => $galakto->id,
                    'name' => 'Πετιμέζι Παραδοσιακό 500ml',
                    'slug' => 'petimezi-paradosiako-500ml',
                    'description' => 'Παραδοσιακό πετιμέζι από σταφύλια Θεσσαλίας. Φυσικό γλυκαντικό, πλούσιο σε σίδηρο.',
                    'price' => 6.50,
                    'weight_per_unit' => 700,
                    'unit' => 'φιάλη',
                    'stock' => 75,
                    'category' => 'Sauces',
                    'image_url' => 'https://images.unsplash.com/photo-1474722883778-792e7990302f',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$sauces],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1474722883778-792e7990302f', 'is_primary' => true, 'sort_order' => 0],
                ],
            ],
            [
                'product_data' => [
                    'producer_id' => $galakto->id,
                    'name' => 'Τραχανάς Ξινός 500g',
                    'slug' => 'trachanas-xinos-500g',
                    'description' => 'Ξινός τραχανάς από ξινόγαλο και σιτάρι. Παραδοσιακή συνταγή Θεσσαλίας, ιδανικός για σούπα.',
                    'price' => 5.80,
                    'weight_per_unit' => 500,
                    'unit' => 'συσκευασία',
                    'stock' => 60,
                    'category' => 'Pasta',
                    'image_url' => 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
                    'status' => 'available',
                    'is_active' => true,
                ],
                'categories' => [$pasta],
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9', 'is_primary' => true, 'sort_order' => 0],
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
