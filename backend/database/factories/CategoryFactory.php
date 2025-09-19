<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement([
                'Fruits', 'Vegetables', 'Herbs', 'Dairy', 'Meat',
                'Bakery', 'Beverages', 'Spices', 'Grains', 'Nuts',
            ]),
            'slug' => $this->faker->unique()->slug(2),
        ];
    }
}
