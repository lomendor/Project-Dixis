<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Rename 7 products that don't fit the 10 shelf-stable categories
 * and fix category assignments for all 17 products.
 *
 * Products renamed:
 *  1  Ντομάτες Βιολογικές      → Φακές Εγχώριες 500g          (legumes-grains)
 *  2  Μαρούλι Φρέσκο            → Χυλοπίτες Σπιτικές 500g     (pasta)
 *  6  Μήλα Ζαγοράς Πηλίου      → Πετιμέζι Παραδοσιακό 500ml  (sauces-spreads)
 *  7  Φέτα ΠΟΠ Θεσσαλίας       → Τραχανάς Ξινός 500g         (pasta)
 * 10  Φέτα ΠΟΠ Μυτιλήνης       → Ελιές Καλαμών 250g          (olive-oil-olives)
 * 11  Πορτοκάλια Βιολογικά      → Μαρμελάδα Πορτοκάλι 380g    (sweets-jams)
 * 12  Πατάτες Νάξου             → Πάστα Ελιάς 200g            (sauces-spreads)
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // Build category lookup by slug
        $catId = fn (string $slug) => DB::table('categories')->where('slug', $slug)->value('id');

        $renames = [
            [
                'old_slug' => 'ntomates-viologikes',
                'new' => [
                    'name' => 'Φακές Εγχώριες 500g',
                    'slug' => 'fakes-egchories-500g',
                    'description' => 'Εγχώριες φακές ψιλές, ιδανικές για σούπα και σαλάτα. Πλούσιες σε πρωτεΐνη και σίδηρο.',
                    'price' => 4.20,
                    'unit' => 'συσκευασία',
                    'weight_per_unit' => 0.500,
                    'weight_grams' => 500,
                    'is_organic' => false,
                    'image_url' => 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082',
                ],
                'category_slug' => 'legumes-grains',
            ],
            [
                'old_slug' => 'marouli-fresko',
                'new' => [
                    'name' => 'Χυλοπίτες Σπιτικές 500g',
                    'slug' => 'chilopites-spitikes-500g',
                    'description' => 'Σπιτικές χυλοπίτες με αυγά ελευθέρας βοσκής και σιμιγδάλι. Παραδοσιακή συνταγή από τη Μεσσηνία.',
                    'price' => 5.90,
                    'unit' => 'συσκευασία',
                    'weight_per_unit' => 0.500,
                    'weight_grams' => 500,
                    'is_organic' => false,
                    'image_url' => 'https://images.unsplash.com/photo-1551462147-ff29053bfc14',
                ],
                'category_slug' => 'pasta',
            ],
            [
                'old_slug' => 'mila-zagoras-piliou',
                'new' => [
                    'name' => 'Πετιμέζι Παραδοσιακό 500ml',
                    'slug' => 'petimezi-paradosiako-500ml',
                    'description' => 'Παραδοσιακό πετιμέζι από σταφύλια Θεσσαλίας. Φυσικό γλυκαντικό, πλούσιο σε σίδηρο.',
                    'price' => 6.50,
                    'unit' => 'φιάλη',
                    'weight_per_unit' => 0.700,
                    'weight_grams' => 700,
                    'is_organic' => false,
                    'image_url' => 'https://images.unsplash.com/photo-1474722883778-792e7990302f',
                ],
                'category_slug' => 'sauces-spreads',
            ],
            [
                'old_slug' => 'feta-pop-thessalias-400g',
                'new' => [
                    'name' => 'Τραχανάς Ξινός 500g',
                    'slug' => 'trachanas-xinos-500g',
                    'description' => 'Ξινός τραχανάς από ξινόγαλο και σιτάρι. Παραδοσιακή συνταγή Θεσσαλίας, ιδανικός για σούπα.',
                    'price' => 5.80,
                    'unit' => 'συσκευασία',
                    'weight_per_unit' => 0.500,
                    'weight_grams' => 500,
                    'is_organic' => false,
                    'image_url' => 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
                ],
                'category_slug' => 'pasta',
            ],
            [
                'old_slug' => 'feta-pop-mytilinis',
                'new' => [
                    'name' => 'Ελιές Καλαμών 250g',
                    'slug' => 'elies-kalamon-250g',
                    'description' => 'Ελιές Καλαμών εξαιρετικής ποιότητας, σκούρες και σαρκώδεις. Ιδανικές για μεζέ και σαλάτες.',
                    'price' => 4.50,
                    'unit' => 'βάζο',
                    'weight_per_unit' => 0.250,
                    'weight_grams' => 250,
                    'is_organic' => false,
                    'image_url' => 'https://images.unsplash.com/photo-1593030103066-0093718e7177',
                ],
                'category_slug' => 'olive-oil-olives',
            ],
            [
                'old_slug' => 'portokalia-viologika',
                'new' => [
                    'name' => 'Μαρμελάδα Πορτοκάλι 380g',
                    'slug' => 'marmelada-portokali-380g',
                    'description' => 'Σπιτική μαρμελάδα πορτοκάλι από βιολογικά πορτοκάλια Αργολίδας. Χωρίς συντηρητικά.',
                    'price' => 4.90,
                    'unit' => 'βάζο',
                    'weight_per_unit' => 0.420,
                    'weight_grams' => 420,
                    'is_organic' => true,
                    'image_url' => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb',
                ],
                'category_slug' => 'sweets-jams',
            ],
            [
                'old_slug' => 'patates-naxou',
                'new' => [
                    'name' => 'Πάστα Ελιάς 200g',
                    'slug' => 'pasta-elias-200g',
                    'description' => 'Πάστα ελιάς (ταπενάντ) από ελιές Καλαμών. Ιδανική ως άλειμμα σε ψωμί ή συνοδευτικό.',
                    'price' => 5.50,
                    'unit' => 'βάζο',
                    'weight_per_unit' => 0.200,
                    'weight_grams' => 200,
                    'is_organic' => false,
                    'image_url' => 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f',
                ],
                'category_slug' => 'sauces-spreads',
            ],
        ];

        foreach ($renames as $item) {
            $product = DB::table('products')->where('slug', $item['old_slug'])->first();
            if (! $product) {
                continue;
            }

            // Update product fields
            DB::table('products')->where('id', $product->id)->update(
                array_merge($item['new'], ['updated_at' => $now])
            );

            // Fix category pivot: remove old, add correct
            DB::table('category_product')->where('product_id', $product->id)->delete();

            $categoryId = $catId($item['category_slug']);
            if ($categoryId) {
                DB::table('category_product')->insertOrIgnore([
                    'product_id' => $product->id,
                    'category_id' => $categoryId,
                ]);
            }

            // Update primary image to match new image_url
            DB::table('product_images')
                ->where('product_id', $product->id)
                ->where('is_primary', true)
                ->update([
                    'url' => $item['new']['image_url'],
                    'updated_at' => $now,
                ]);
        }
    }

    public function down(): void
    {
        // Not reversible — old product names and category assignments are lost.
    }
};
