<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Seed realistic Greek reviews for all products.
     *
     * - 2-4 reviews per product, ratings 3-5 (artisan quality!)
     * - Greek titles & comments
     * - is_approved=true for public display
     * - firstOrCreate on [user_id, product_id] for idempotency
     */
    public function run(): void
    {
        // Collect reviewer users (consumer + demo customers)
        $reviewerEmails = [
            'consumer@example.com',
            'customer1@demo.com',
            'customer2@demo.com',
            'customer3@demo.com',
            'customer4@demo.com',
            'customer5@demo.com',
        ];

        $reviewers = User::whereIn('email', $reviewerEmails)->get();

        if ($reviewers->isEmpty()) {
            $this->command->warn('No reviewer users found — skipping ReviewSeeder.');
            return;
        }

        $products = Product::all();

        if ($products->isEmpty()) {
            $this->command->warn('No products found — skipping ReviewSeeder.');
            return;
        }

        $greekReviews = $this->getGreekReviews();
        $seeded = 0;

        foreach ($products as $product) {
            // 2-4 reviews per product
            $numReviews = rand(2, 4);
            $shuffledReviewers = $reviewers->shuffle();

            for ($i = 0; $i < $numReviews && $i < $shuffledReviewers->count(); $i++) {
                $user = $shuffledReviewers[$i];
                $review = $greekReviews[array_rand($greekReviews)];

                Review::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'product_id' => $product->id,
                    ],
                    [
                        'rating' => $review['rating'],
                        'title' => $review['title'],
                        'comment' => $review['comment'],
                        'is_verified_purchase' => (bool) rand(0, 1),
                        'is_approved' => true,
                        'created_at' => now()->subDays(rand(1, 90)),
                    ]
                );
                $seeded++;
            }
        }

        $this->command->info("ReviewSeeder: {$seeded} reviews seeded across {$products->count()} products.");
    }

    /**
     * Pool of realistic Greek reviews with ratings 3-5.
     */
    private function getGreekReviews(): array
    {
        return [
            ['rating' => 5, 'title' => 'Εξαιρετικό!', 'comment' => 'Απίστευτη ποιότητα, θα παραγγείλω ξανά σίγουρα!'],
            ['rating' => 5, 'title' => 'Το καλύτερο που δοκίμασα', 'comment' => 'Φρέσκο, αρωματικό, ακριβώς όπως το περίμενα.'],
            ['rating' => 5, 'title' => 'Φανταστικό', 'comment' => 'Η γεύση είναι μοναδική. Προτείνω ανεπιφύλακτα.'],
            ['rating' => 5, 'title' => 'Αυθεντικό ελληνικό', 'comment' => 'Σαν να το αγόρασα από χωριό! Τέλεια ποιότητα.'],
            ['rating' => 4, 'title' => 'Πολύ καλό', 'comment' => 'Πολύ καλή ποιότητα, γρήγορη αποστολή.'],
            ['rating' => 4, 'title' => 'Ευχαριστημένος/η', 'comment' => 'Ωραία γεύση, καλή τιμή. Θα ξαναπαραγγείλω.'],
            ['rating' => 4, 'title' => 'Καλή επιλογή', 'comment' => 'Σωστή σχέση ποιότητας-τιμής. Συνιστώ!'],
            ['rating' => 4, 'title' => 'Νόστιμο!', 'comment' => 'Πολύ νόστιμο προϊόν, η συσκευασία ήταν άψογη.'],
            ['rating' => 4, 'title' => 'Ικανοποιητικό', 'comment' => 'Καλό προϊόν, ίσως λίγο ακριβό αλλά αξίζει.'],
            ['rating' => 3, 'title' => 'Αρκετά καλό', 'comment' => 'Καλή ποιότητα αλλά αναμένω λίγο πιο έντονη γεύση.'],
            ['rating' => 3, 'title' => 'Μέτριο', 'comment' => 'Εντάξει για την τιμή του, τίποτα το ιδιαίτερο.'],
            ['rating' => 5, 'title' => 'Δεν αλλάζω!', 'comment' => 'Τρίτη παραγγελία μου. Δεν αλλάζω παραγωγό!'],
            ['rating' => 5, 'title' => 'Συγκλονιστικό άρωμα', 'comment' => 'Μόλις το άνοιξα κατάλαβα την ποιότητα. Μπράβο!'],
            ['rating' => 4, 'title' => 'Γρήγορη παράδοση', 'comment' => 'Ήρθε σε 2 μέρες, φρέσκο και καλά συσκευασμένο.'],
            ['rating' => 5, 'title' => 'Δώρο που εντυπωσίασε', 'comment' => 'Το πήρα για δώρο και ενθουσιάστηκαν! Υπέροχο.'],
        ];
    }
}
