<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Producer;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->words(3, true);
        return [
            'producer_id' => Producer::factory(),
            'name' => $name,
            'slug' => Str::slug($name) . '-' . fake()->unique()->randomNumber(5),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 5, 100),
            'weight_per_unit' => fake()->randomFloat(3, 0.1, 5.0),
            'unit' => fake()->randomElement(['kg', 'piece', 'liter', 'box']),
            'stock' => fake()->numberBetween(0, 200),
            'category' => fake()->randomElement(['fruits', 'vegetables', 'dairy', 'meat', 'grains']),
            'is_organic' => fake()->boolean(40), // 40% chance of being organic
            'status' => fake()->randomElement(['available', 'unavailable', 'seasonal']),
            'is_active' => true,
        ];
    }
}
