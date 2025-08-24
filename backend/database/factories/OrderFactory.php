<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 10, 200);
        $taxAmount = $subtotal * 0.10;
        $shippingAmount = fake()->randomFloat(2, 3, 10);
        $totalAmount = $subtotal + $taxAmount + $shippingAmount;

        return [
            'user_id' => User::factory(),
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'shipping_amount' => $shippingAmount,
            'total_amount' => $totalAmount,
            'payment_status' => fake()->randomElement(['pending', 'paid', 'failed', 'cancelled']),
            'status' => fake()->randomElement(['pending', 'processing', 'completed', 'cancelled']),
            'shipping_method' => fake()->randomElement(['HOME', 'PICKUP']),
            'shipping_address' => null,
            'billing_address' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Indicate that the order is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => 'pending',
            'status' => 'pending',
        ]);
    }

    /**
     * Indicate that the order is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => 'paid',
            'status' => 'completed',
        ]);
    }
}