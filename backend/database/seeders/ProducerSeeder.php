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
        // Παραγωγός 1: Κτήμα Παπαδόπουλου (linked to producer@example.com)
        $producerUser = User::where('email', 'producer@example.com')->first();

        if ($producerUser) {
            $this->createProducerIfNotExists($producerUser->id, [
                'name' => 'Κτήμα Παπαδόπουλου',
                'slug' => 'ktima-papadopoulou',
                'business_name' => 'Κτήμα Παπαδόπουλου Ο.Ε.',
                'description' => 'Βιολογικά λαχανικά και φρούτα από οικογενειακό αγρόκτημα στη Μεσσηνία. Καλλιεργούμε με σεβασμό στη γη από το 1985.',
                'location' => 'Καλαμάτα, Μεσσηνία',
                'phone' => '+30 272 1012345',
                'email' => 'info@ktimapapadopoulou.gr',
                'website' => 'https://ktimapapadopoulou.gr',
            ]);
        }

        // Παραγωγός 2: Μελισσοκομία Κρήτης
        $honeyUser = User::firstOrCreate(
            ['email' => 'producer2@example.com'],
            [
                'name' => 'Νίκος Στεφανάκης',
                'email' => 'producer2@example.com',
                'role' => 'producer',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $this->createProducerIfNotExists($honeyUser->id, [
            'name' => 'Μελισσοκομία Κρήτης',
            'slug' => 'melissokomia-kritis',
            'business_name' => 'Μελισσοκομία Κρήτης — Στεφανάκης',
            'description' => 'Παραδοσιακή μελισσοκομία τρίτης γενιάς στα βουνά της Κρήτης. Θυμαρίσιο μέλι, ελαιόλαδο και προϊόντα κυψέλης.',
            'location' => 'Ηράκλειο, Κρήτη',
            'phone' => '+30 281 0987654',
            'email' => 'info@melissakritis.gr',
            'website' => 'https://melissakritis.gr',
        ]);

        // Παραγωγός 3: Γαλακτοκομικά Ολύμπου
        $dairyUser = User::firstOrCreate(
            ['email' => 'producer3@example.com'],
            [
                'name' => 'Γιώργος Τσιμπούκης',
                'email' => 'producer3@example.com',
                'role' => 'producer',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $this->createProducerIfNotExists($dairyUser->id, [
            'name' => 'Γαλακτοκομικά Ολύμπου',
            'slug' => 'galaktokomika-olympou',
            'business_name' => 'Γαλακτοκομικά Ολύμπου Α.Ε.',
            'description' => 'Παραδοσιακά γαλακτοκομικά προϊόντα από τους πρόποδες του Ολύμπου. Φέτα ΠΟΠ, γιαούρτι και τυριά με γάλα ελευθέρας βοσκής.',
            'location' => 'Λάρισα, Θεσσαλία',
            'phone' => '+30 241 0567890',
            'email' => 'info@galaktokomika-olympou.gr',
            'website' => 'https://galaktokomika-olympou.gr',
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
