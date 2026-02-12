<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Greek-first category names (slug stays English for URLs)
        $categories = [
            'fruits' => 'Φρούτα',
            'vegetables' => 'Λαχανικά',
            'herbs-spices' => 'Βότανα & Μπαχαρικά',
            'grains-cereals' => 'Δημητριακά & Όσπρια',
            'dairy-products' => 'Γαλακτοκομικά',
            'olive-oil-olives' => 'Ελαιόλαδο & Ελιές',
            'wine-beverages' => 'Κρασιά & Ποτά',
            'honey-preserves' => 'Μέλι & Κονσέρβες',
            // Phase 3: Categories needed by Greek storefront products
            'legumes' => 'Όσπρια',
            'pasta-trahanas' => 'Ζυμαρικά & Τραχανάς',
            'flours-bakery' => 'Αλεύρια & Αρτοποιία',
            'nuts-dried-fruits' => 'Ξηροί Καρποί',
            'sweets-preserves' => 'Γλυκά & Μαρμελάδες',
            'sauces-pickles' => 'Σάλτσες & Τουρσιά',
        ];

        foreach ($categories as $slug => $greekName) {
            Category::firstOrCreate([
                'slug' => $slug,
            ], [
                'name' => $greekName,
                'slug' => $slug,
            ]);
        }
    }
}
