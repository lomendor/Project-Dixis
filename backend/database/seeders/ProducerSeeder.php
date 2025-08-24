<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProducerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $producers = [
            [
                'name' => 'Green Farm Co.',
                'business_name' => 'Green Farm Company Ltd',
                'description' => 'Organic vegetables and fruits from local farms',
                'location' => 'Athens, Greece',
                'phone' => '+30 210 1234567',
                'email' => 'info@greenfarm.gr',
                'website' => 'https://greenfarm.gr',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Mediterranean Harvest',
                'business_name' => 'Mediterranean Harvest SA',
                'description' => 'Traditional Greek products and olive oil',
                'location' => 'Crete, Greece',
                'phone' => '+30 28210 98765',
                'email' => 'contact@medharvest.gr',
                'website' => 'https://medharvest.gr',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fresh Valley',
                'business_name' => null,
                'description' => 'Seasonal fruits and vegetables',
                'location' => 'Thessaloniki, Greece',
                'phone' => '+30 2310 555444',
                'email' => 'orders@freshvalley.gr',
                'website' => null,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('producers')->insert($producers);
    }
}
