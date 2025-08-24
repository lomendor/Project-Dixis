<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Producer;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first producer (created in ProducerSeeder)
        $producer = Producer::first();
        
        if (!$producer) {
            $this->command->warn('No producers found. Skipping product seeding.');
            return;
        }
        
        $products = [
            [
                'producer_id' => $producer->id,
                'name' => 'Organic Tomatoes',
                'slug' => Str::slug('Organic Tomatoes'),
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
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'producer_id' => $producer->id,
                'name' => 'Fresh Lettuce',
                'slug' => Str::slug('Fresh Lettuce'),
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
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'producer_id' => $producer->id,
                'name' => 'Extra Virgin Olive Oil',
                'slug' => Str::slug('Extra Virgin Olive Oil'),
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
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('products')->insert($products);
    }
}
