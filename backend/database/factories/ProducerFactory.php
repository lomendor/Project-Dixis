<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Producer>
 */
class ProducerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'user_id' => User::factory(),
            'name' => $name,
            'slug' => $this->generateUniqueSlug(Str::slug($name)),
            'business_name' => fake()->company().' LLC',
            'description' => fake()->paragraph(),
            'location' => fake()->city().', '.fake()->country(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'website' => fake()->url(),
            'status' => 'active',
        ];
    }

    /**
     * Generate collision-safe unique slug
     */
    private function generateUniqueSlug(string $baseSlug): string
    {
        $slug = $baseSlug;
        $counter = 1;

        // Simple unique slug generation - during testing this is usually unique anyway
        while (\App\Models\Producer::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
