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
        $categories = [
            'Fruits',
            'Vegetables',
            'Herbs & Spices',
            'Grains & Cereals',
            'Dairy Products',
            'Olive Oil & Olives',
            'Wine & Beverages',
            'Honey & Preserves',
        ];

        foreach ($categories as $categoryName) {
            Category::firstOrCreate([
                'slug' => Str::slug($categoryName),
            ], [
                'name' => $categoryName,
                'slug' => Str::slug($categoryName),
            ]);
        }
    }
}
