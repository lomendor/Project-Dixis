<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;

class ProducerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the producer user created in DatabaseSeeder
        $producerUser = User::where('email', 'producer@example.com')->first();
        
        if (!$producerUser) {
            $this->command->warn('Producer user not found. Skipping producer seeding.');
            return;
        }
        
        $producers = [
            [
                'user_id' => $producerUser->id,
                'name' => 'Green Farm Co.',
                'slug' => $this->generateUniqueSlug('green-farm-co'),
                'business_name' => 'Green Farm Company Ltd',
                'description' => 'Organic vegetables and fruits from local farms',
                'location' => 'Athens, Greece',
                'phone' => '+30 210 1234567',
                'email' => 'info@greenfarm.gr',
                'website' => 'https://greenfarm.gr',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        DB::table('producers')->insert($producers);
    }
    
    /**
     * Generate collision-safe unique slug
     */
    private function generateUniqueSlug(string $baseSlug): string
    {
        $slug = $baseSlug;
        $counter = 1;
        
        while (DB::table('producers')->where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        
        return $slug;
    }
}
