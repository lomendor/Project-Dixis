<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Phase 10: Definitive 10 locker-compatible categories for Greek
     * artisan products. Covers all non-refrigerated, shelf-stable goods
     * suitable for parcel delivery (Skroutz Point, ACS, ΕΛΤΑ, etc.).
     */
    public function run(): void
    {
        $categories = [
            'olive-oil-olives'  => 'Ελαιόλαδο & Ελιές',
            'honey-bee'         => 'Μέλι & Προϊόντα Μέλισσας',
            'nuts-dried'        => 'Ξηροί Καρποί',
            'cosmetics'         => 'Φυσικά Καλλυντικά',
            'beverages'         => 'Ποτά',
            'sweets-jams'       => 'Γλυκά & Μαρμελάδες',
            'pasta'             => 'Ζυμαρικά',
            'herbs-spices-tea'  => 'Βότανα, Μπαχαρικά & Τσάι',
            'sauces-spreads'    => 'Σάλτσες & Αλείμματα',
            'legumes-grains'    => 'Όσπρια & Δημητριακά',
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
