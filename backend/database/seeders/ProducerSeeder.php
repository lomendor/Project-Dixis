<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProducerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates 3 distinct producers for realistic multi-producer testing.
     */
    public function run(): void
    {
        // Producer 1: Green Farm Co. (linked to producer@example.com)
        $producerUser = User::where('email', 'producer@example.com')->first();

        if ($producerUser) {
            $this->createProducerIfNotExists($producerUser->id, [
                'name' => 'Green Farm Co.',
                'slug' => 'green-farm-co',
                'business_name' => 'Green Farm Company Ltd',
                'description' => 'Organic vegetables and fruits from local farms',
                'location' => 'Athens, Greece',
                'phone' => '+30 210 1234567',
                'email' => 'info@greenfarm.gr',
                'website' => 'https://greenfarm.gr',
            ]);
        }

        // Producer 2: Cretan Honey (create user if needed)
        $honeyUser = User::firstOrCreate(
            ['email' => 'producer2@example.com'],
            [
                'name' => 'Cretan Honey Producer',
                'email' => 'producer2@example.com',
                'role' => 'producer',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $this->createProducerIfNotExists($honeyUser->id, [
            'name' => 'Cretan Honey',
            'slug' => 'cretan-honey',
            'business_name' => 'Cretan Honey Producers Co-op',
            'description' => 'Traditional honey and bee products from Crete',
            'location' => 'Heraklion, Crete',
            'phone' => '+30 281 0987654',
            'email' => 'info@cretanhoney.gr',
            'website' => 'https://cretanhoney.gr',
        ]);

        // Producer 3: Mount Olympus Dairy (create user if needed)
        $dairyUser = User::firstOrCreate(
            ['email' => 'producer3@example.com'],
            [
                'name' => 'Olympus Dairy Producer',
                'email' => 'producer3@example.com',
                'role' => 'producer',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $this->createProducerIfNotExists($dairyUser->id, [
            'name' => 'Mount Olympus Dairy',
            'slug' => 'mount-olympus-dairy',
            'business_name' => 'Mount Olympus Dairy Products SA',
            'description' => 'Traditional Greek dairy products and cheeses',
            'location' => 'Larissa, Thessaly',
            'phone' => '+30 241 0567890',
            'email' => 'info@olympusdairy.gr',
            'website' => 'https://olympusdairy.gr',
        ]);
    }

    /**
     * Create producer if not already exists for this user.
     */
    private function createProducerIfNotExists(int $userId, array $data): void
    {
        $existingProducer = DB::table('producers')->where('user_id', $userId)->first();

        if (! $existingProducer) {
            DB::table('producers')->insert(array_merge($data, [
                'user_id' => $userId,
                'slug' => $this->generateUniqueSlug($data['slug']),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    /**
     * Generate collision-safe unique slug
     */
    private function generateUniqueSlug(string $baseSlug): string
    {
        $slug = $baseSlug;
        $counter = 1;

        while (DB::table('producers')->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
