<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Producer;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ErdMvpSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create producer user
        $producerUser = User::firstOrCreate(
            ['email' => 'producer@dixis.test'],
            [
                'name' => 'Δημήτρης Παπαδόπουλος',
                'email' => 'producer@dixis.test',
                'password' => Hash::make('password'),
                'role' => 'producer',
                'email_verified_at' => now(),
            ]
        );

        // Create producer profile
        $producer = Producer::firstOrCreate(
            ['user_id' => $producerUser->id],
            [
                'name' => 'Παπαδόπουλος Αγρόκτημα',
                'business_name' => 'Αγρόκτημα Παπαδόπουλος Α.Ε.',
                'description' => 'Παραγωγή βιολογικών προϊόντων στην περιοχή της Κρήτης από το 1985',
                'location' => 'Ηράκλειο, Κρήτη',
                'phone' => '+30 2810 123456',
                'email' => 'info@papadopoulos-farm.gr',
                'website' => 'https://papadopoulos-farm.gr',
                'status' => 'active',
                'slug' => 'papadopoulos-farm',
                'is_active' => true,
                'tax_id' => '123456789',
                'tax_office' => 'Ηρακλείου',
                'address' => 'Αγροτική Περιοχή Κουνάβοι',
                'city' => 'Ηράκλειο',
                'postal_code' => '71500',
                'region' => 'Κρήτη',
                'verified' => true,
            ]
        );

        // Create categories
        $vegetableCategory = Category::firstOrCreate(
            ['slug' => 'vegetables'],
            [
                'name' => 'Λαχανικά',
                'slug' => 'vegetables',
            ]
        );

        $fruitCategory = Category::firstOrCreate(
            ['slug' => 'fruits'],
            [
                'name' => 'Φρούτα',
                'slug' => 'fruits',
            ]
        );

        // Create Product 1: Organic Tomatoes
        $product1 = Product::firstOrCreate(
            ['slug' => 'organic-tomatoes-papadopoulos'],
            [
                'producer_id' => $producer->id,
                'name' => 'Βιολογικές Ντομάτες',
                'title' => 'Βιολογικές Ντομάτες Κρήτης',
                'slug' => 'organic-tomatoes-papadopoulos',
                'description' => 'Φρέσκες βιολογικές ντομάτες καλλιεργημένες με παραδοσιακές μεθόδους στην Κρήτη. Πλούσια γεύση και άρωμα.',
                'price' => 3.50,
                'currency' => 'EUR',
                'unit' => 'kg',
                'stock' => 100,
                'weight_per_unit' => 1.0,
                'weight_grams' => 1000,
                'length_cm' => 8.0,
                'width_cm' => 8.0,
                'height_cm' => 6.0,
                'is_active' => true,
                'is_organic' => true,
                'is_seasonal' => false,
                'status' => 'available',
            ]
        );

        // Create Product 2: Extra Virgin Olive Oil
        $product2 = Product::firstOrCreate(
            ['slug' => 'extra-virgin-olive-oil-papadopoulos'],
            [
                'producer_id' => $producer->id,
                'name' => 'Εξαιρετικό Παρθένο Ελαιόλαδο',
                'title' => 'Εξαιρετικό Παρθένο Ελαιόλαδο Κρήτης',
                'slug' => 'extra-virgin-olive-oil-papadopoulos',
                'description' => 'Εξαιρετικό παρθένο ελαιόλαδο ψυχρής έκθλιψης από κορωνέικη ελιά. Χαμηλή οξύτητα (<0.3%) και μοναδική γεύση.',
                'price' => 12.00,
                'currency' => 'EUR',
                'unit' => 'bottle',
                'stock' => 50,
                'weight_per_unit' => 0.5,
                'weight_grams' => 500,
                'length_cm' => 6.5,
                'width_cm' => 6.5,
                'height_cm' => 23.0,
                'is_active' => true,
                'is_organic' => true,
                'is_seasonal' => false,
                'status' => 'available',
            ]
        );

        // Attach categories to products
        $product1->categories()->sync([$vegetableCategory->id]);
        $product2->categories()->sync([$fruitCategory->id]); // Olive oil could be in a different category

        // Create a sample address for the producer user
        $producerUser->addresses()->firstOrCreate(
            ['type' => 'shipping'],
            [
                'type' => 'shipping',
                'name' => 'Δημήτρης Παπαδόπουλος',
                'line1' => 'Αγροτική Περιοχή Κουνάβοι',
                'line2' => 'Οικόπεδο 15',
                'city' => 'Ηράκλειο',
                'postal_code' => '71500',
                'country' => 'GR',
                'phone' => '+30 2810 123456',
            ]
        );

        $this->command->info('ERD MVP Seeder completed successfully:');
        $this->command->info('- Created 1 producer user and profile');
        $this->command->info('- Created 2 products with full ERD schema');
        $this->command->info('- Created sample categories and address');
    }
}
