<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'producer_id' => 1,
                'name' => 'Organic Tomatoes',
                'slug' => Str::slug('Organic Tomatoes'),
                'description' => 'Fresh organic tomatoes grown without pesticides',
                'price' => 3.50,
                'unit' => 'kg',
                'stock' => 100,
                'category' => 'Vegetables',
                'image_url' => 'https://images.unsplash.com/photo-1592841200221-a6898f307baa',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'producer_id' => 1,
                'name' => 'Fresh Lettuce',
                'slug' => Str::slug('Fresh Lettuce'),
                'description' => 'Crispy fresh lettuce perfect for salads',
                'price' => 2.25,
                'unit' => 'piece',
                'stock' => 50,
                'category' => 'Vegetables',
                'image_url' => 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'producer_id' => 2,
                'name' => 'Extra Virgin Olive Oil',
                'slug' => Str::slug('Extra Virgin Olive Oil'),
                'description' => 'Premium Greek olive oil from Crete',
                'price' => 12.00,
                'unit' => 'bottle',
                'stock' => 25,
                'category' => 'Oil',
                'image_url' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'producer_id' => 2,
                'name' => 'Greek Honey',
                'slug' => Str::slug('Greek Honey'),
                'description' => 'Pure honey from Mediterranean flowers',
                'price' => 8.75,
                'unit' => 'jar',
                'stock' => 30,
                'category' => 'Honey',
                'image_url' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'producer_id' => 3,
                'name' => 'Seasonal Apples',
                'slug' => Str::slug('Seasonal Apples'),
                'description' => 'Fresh seasonal apples from local orchards',
                'price' => 4.20,
                'unit' => 'kg',
                'stock' => 0,
                'category' => 'Fruits',
                'image_url' => 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb',
                'status' => 'seasonal',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('products')->insert($products);
    }
}
