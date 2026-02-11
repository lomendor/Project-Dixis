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
        $dairy = Category::where('slug', 'dairy-products')->first();
        $honey = Category::where('slug', 'honey-preserves')->first();

        // Get producers by slug for explicit assignment, with fallbacks
        $ktima = $producers->firstWhere('slug', 'ktima-papadopoulou') ?? $producers->firstWhere('slug', 'green-farm-co') ?? $producers->first();
        $melissa = $producers->firstWhere('slug', 'melissokomia-kritis') ?? $producers->firstWhere('slug', 'cretan-honey') ?? $producers->skip(1)->first() ?? $ktima;
        $galakto = $producers->firstWhere('slug', 'galaktokomika-olympou') ?? $producers->firstWhere('slug', 'mount-olympus-dairy') ?? $producers->skip(2)->first() ?? $ktima;

        // Create products distributed across producers
        $productsData = [
            // ΚΤΗΜΑ ΠΑΠΑΔΟΠΟΥΛΟΥ — λαχανικά, βότανα, φρούτα
            [
                'product_data' => [
                    'producer_id' => $ktima->id,
                    'name' => 'Ντομάτες Βιολογικές',
                    'slug' => 'ntomates-viologikes',
                    'description' => 'Φρέσκες βιολογικές ντομάτες από το κτήμα μας στη Μεσσηνία. Καλλιεργούνται χωρίς φυτοφάρμακα με παραδοσιακές μεθόδους.',
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
                    'producer_id' => $ktima->id,
                    'name' => 'Μαρούλι Φρέσκο',
                    'slug' => 'marouli-fresko',
                    'description' => 'Τραγανό φρέσκο μαρούλι, ιδανικό για σαλάτες. Μαζεύεται κάθε πρωί από τον κήπο μας.',
                    'price' => 2.25,
                    'weight_per_unit' => 0.300,
                    'unit' => 'τεμάχιο',
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
                    'producer_id' => $ktima->id,
                    'name' => 'Ρίγανη Βουνού 100g',
                    'slug' => 'rigani-vounou-100g',
                    'description' => 'Αρωματική ελληνική ρίγανη βουνού, αποξηραμένη με τον παραδοσιακό τρόπο. Ιδανική για σαλάτες και ψητά.',
                    'price' => 3.50,
                    'weight_per_unit' => 0.100,
                    'unit' => 'συσκευασία',
                    'stock' => 80,
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
            // ΜΕΛΙΣΣΟΚΟΜΙΑ ΚΡΗΤΗΣ — ελαιόλαδο, μέλι
            [
                'product_data' => [
                    'producer_id' => $melissa->id,
                    'name' => 'Εξαιρετικό Παρθένο Ελαιόλαδο 500ml',
                    'slug' => 'exairetiko-partheno-elaiolado-500ml',
                    'description' => 'Premium ελαιόλαδο εξαιρετικό παρθένο από βιολογικούς ελαιώνες της Κρήτης. Χαμηλή οξύτητα, πλούσια γεύση.',
                    'price' => 12.00,
                    'weight_per_unit' => 0.500,
                    'unit' => 'φιάλη',
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
                    'producer_id' => $melissa->id,
                    'name' => 'Θυμαρίσιο Μέλι Κρήτης 450g',
                    'slug' => 'thymarisio-meli-kritis-450g',
                    'description' => 'Αγνό θυμαρίσιο μέλι από τα βουνά της Κρήτης. Συλλέγεται χειροποίητα από τα μελίσσια μας σε υψόμετρο 800μ.',
                    'price' => 15.00,
                    'weight_per_unit' => 0.450,
                    'unit' => 'βάζο',
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
            // ΓΑΛΑΚΤΟΚΟΜΙΚΑ ΟΛΥΜΠΟΥ — φρούτα, γαλακτοκομικά
            [
                'product_data' => [
                    'producer_id' => $galakto->id,
                    'name' => 'Μήλα Ζαγοράς Πηλίου',
                    'slug' => 'mila-zagoras-piliou',
                    'description' => 'Τραγανά μήλα ΠΟΠ Ζαγοράς Πηλίου. Φυσική γλυκύτητα και τραγανή υφή, ιδανικά για κατανάλωση και μαγειρική.',
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
                    'producer_id' => $galakto->id,
                    'name' => 'Φέτα ΠΟΠ Θεσσαλίας 400g',
                    'slug' => 'feta-pop-thessalias-400g',
                    'description' => 'Αυθεντική φέτα ΠΟΠ από γάλα ελευθέρας βοσκής στους πρόποδες του Ολύμπου. Κρεμώδης υφή, πλούσια γεύση.',
                    'price' => 8.50,
                    'weight_per_unit' => 0.400,
                    'unit' => 'συσκευασία',
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
