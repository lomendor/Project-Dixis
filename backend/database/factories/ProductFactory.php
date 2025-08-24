<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

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
            'name' => $name,
            'slug' => \Str::slug($name) . '-' . fake()->unique()->randomNumber(5),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 5, 100),
            'unit' => fake()->randomElement(['kg', 'piece', 'liter', 'box']),
            'category' => fake()->randomElement(['fruits', 'vegetables', 'dairy', 'meat', 'grains']),
            'is_active' => true,
        ];
    }
}
