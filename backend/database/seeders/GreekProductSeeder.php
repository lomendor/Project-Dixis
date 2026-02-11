<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Producer;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Phase 3 (STOREFRONT-LARAVEL-01): Seed Greek-named products and producers.
 *
 * Mirrors the Prisma seed data so the storefront has a rich Greek catalog.
 * Safe to re-run: uses firstOrCreate throughout.
 */
class GreekProductSeeder extends Seeder
{
    public function run(): void
    {
        // --- Producers (with backing User accounts) ---

        $malisUser = User::firstOrCreate(
            ['email' => 'malis@dixis.gr'],
            ['name' => 'Malis Garden', 'password' => bcrypt('demo-seed-2026')]
        );
        $malis = Producer::firstOrCreate(
            ['slug' => 'malis-garden'],
            [
                'user_id' => $malisUser->id,
                'name' => 'Malis Garden',
                'business_name' => 'Malis Garden',
                'description' => 'Παραδοσιακό βιολογικό αγρόκτημα με ελαιόλαδο και κονσέρβες',
                'location' => 'Attica',
                'phone' => '+30 210 0000001',
                'email' => 'malis@dixis.gr',
                'status' => 'active',
                'is_active' => true,
            ]
        );

        $lemnosUser = User::firstOrCreate(
            ['email' => 'lemnos@dixis.gr'],
            ['name' => 'Lemnos Honey Co', 'password' => bcrypt('demo-seed-2026')]
        );
        $lemnos = Producer::firstOrCreate(
            ['slug' => 'lemnos-honey-co'],
            [
                'user_id' => $lemnosUser->id,
                'name' => 'Lemnos Honey Co',
                'business_name' => 'Lemnos Honey Co',
                'description' => 'Οικογενειακή μελισσοκομία με premium θυμαρίσιο μέλι',
                'location' => 'Lemnos',
                'phone' => '+30 210 0000002',
                'email' => 'lemnos@dixis.gr',
                'status' => 'active',
                'is_active' => true,
            ]
        );

        // --- Categories (look up by slug; CategorySeeder must run first) ---

        $cat = fn (string $slug) => Category::where('slug', $slug)->first();

        // --- Products ---
        // Mirrors Prisma seed: 10 Greek products across 2 producers.

        $products = [
            // ─── Malis Garden (6 products) ───
            [
                'producer' => $malis,
                'data' => [
                    'name' => 'Εξαιρετικό Παρθένο Ελαιόλαδο 1L',
                    'slug' => 'exairetiko-partheno-elaiolado-1l',
                    'description' => 'Extra virgin olive oil from organic olives',
                    'price' => 10.90,
                    'unit' => 'bottle',
                    'stock' => 45,
                    'is_organic' => true,
                    'is_active' => true,
                ],
                'category' => 'olive-oil-olives',
                'image' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5',
            ],
            [
                'producer' => $malis,
                'data' => [
                    'name' => 'Γλυκό Κουταλιού Σύκο 380g',
                    'slug' => 'glyko-koutaliou-syko-380g',
                    'description' => 'Traditional fig spoon sweet',
                    'price' => 4.50,
                    'unit' => 'jar',
                    'stock' => 30,
                    'is_organic' => false,
                    'is_active' => true,
                ],
                'category' => 'sweets-preserves',
                'image' => 'https://images.unsplash.com/photo-1597714026720-8f74c62310ba',
            ],
            [
                'producer' => $malis,
                'data' => [
                    'name' => 'Φέτα ΠΟΠ Μυτιλήνης 400g',
                    'slug' => 'feta-pop-mytilinis',
                    'description' => 'Authentic PDO feta cheese from Mytilini',
                    'price' => 6.50,
                    'unit' => 'pack',
                    'stock' => 25,
                    'is_organic' => false,
                    'is_active' => true,
                ],
                'category' => 'dairy-products',
                'image' => 'https://images.unsplash.com/photo-1559561853-08451507cbe7',
            ],
            [
                'producer' => $malis,
                'data' => [
                    'name' => 'Πορτοκάλια Βιολογικά 5kg',
                    'slug' => 'portokalia-viologika',
                    'description' => 'Organic oranges from Argolida',
                    'price' => 8.90,
                    'unit' => 'box',
                    'stock' => 60,
                    'is_organic' => true,
                    'is_active' => true,
                ],
                'category' => 'fruits',
                'image' => 'https://images.unsplash.com/photo-1547036967-23d11aacaee0',
            ],
            [
                'producer' => $malis,
                'data' => [
                    'name' => 'Πατάτες Νάξου 3kg',
                    'slug' => 'patates-naxou',
                    'description' => 'Famous potatoes from Naxos island',
                    'price' => 4.90,
                    'unit' => 'bag',
                    'stock' => 100,
                    'is_organic' => false,
                    'is_active' => true,
                ],
                'category' => 'vegetables',
                'image' => 'https://images.unsplash.com/photo-1518977676601-b53f82ber39a',
            ],
            [
                'producer' => $malis,
                'data' => [
                    'name' => 'Τραχανάς Σπιτικός 500g',
                    'slug' => 'trachanas-spitikos',
                    'description' => 'Traditional homemade trahanas',
                    'price' => 5.50,
                    'unit' => 'pack',
                    'stock' => 40,
                    'is_organic' => false,
                    'is_active' => true,
                ],
                'category' => 'pasta-trahanas',
                'image' => 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
            ],

            // ─── Lemnos Honey Co (4 products) ───
            [
                'producer' => $lemnos,
                'data' => [
                    'name' => 'Θυμαρίσιο Μέλι 450g',
                    'slug' => 'thymarisio-meli-450g',
                    'description' => 'Premium thyme honey from Lemnos island',
                    'price' => 7.90,
                    'unit' => 'jar',
                    'stock' => 50,
                    'is_organic' => true,
                    'is_active' => true,
                ],
                'category' => 'honey-preserves',
                'image' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
            ],
            [
                'producer' => $lemnos,
                'data' => [
                    'name' => 'Τσίπουρο Παραδοσιακό 700ml',
                    'slug' => 'tsipouro-paradosiako',
                    'description' => 'Traditional Greek tsipouro spirit',
                    'price' => 12.90,
                    'unit' => 'bottle',
                    'stock' => 20,
                    'is_organic' => false,
                    'is_active' => true,
                ],
                'category' => 'wine-beverages',
                'image' => 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b',
            ],
            [
                'producer' => $lemnos,
                'data' => [
                    'name' => 'Ρίγανη Βουνού 100g',
                    'slug' => 'rigani-vounou',
                    'description' => 'Wild mountain oregano from Epirus',
                    'price' => 3.50,
                    'unit' => 'pack',
                    'stock' => 80,
                    'is_organic' => true,
                    'is_active' => true,
                ],
                'category' => 'herbs-spices',
                'image' => 'https://images.unsplash.com/photo-1515586000433-45406d8e6662',
            ],
            [
                'producer' => $lemnos,
                'data' => [
                    'name' => 'Κρασί Λήμνου Ερυθρό 750ml',
                    'slug' => 'krasi-limnou-erythro',
                    'description' => 'Red wine from Lemnos vineyards',
                    'price' => 9.90,
                    'unit' => 'bottle',
                    'stock' => 30,
                    'is_organic' => false,
                    'is_active' => true,
                ],
                'category' => 'wine-beverages',
                'image' => 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d',
            ],
        ];

        foreach ($products as $item) {
            $productData = array_merge($item['data'], [
                'producer_id' => $item['producer']->id,
            ]);

            $product = Product::firstOrCreate(
                ['slug' => $productData['slug']],
                $productData
            );

            // Attach category
            $category = $cat($item['category']);
            if ($category) {
                $product->categories()->syncWithoutDetaching([$category->id]);
            }

            // Create primary image
            ProductImage::firstOrCreate(
                ['product_id' => $product->id, 'url' => $item['image']],
                ['product_id' => $product->id, 'url' => $item['image'], 'is_primary' => true, 'sort_order' => 0]
            );
        }

        $this->command->info('Greek products seeded: ' . count($products) . ' products, 2 producers.');
    }
}
