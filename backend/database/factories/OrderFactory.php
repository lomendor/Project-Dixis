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
        $shippingCost = fake()->randomFloat(2, 0, 5);
        $total = $subtotal + $shippingCost;

        return [
            'user_id' => null, // nullable as per requirements
            'status' => fake()->randomElement(['pending', 'confirmed', 'processing', 'shipped', 'completed', 'delivered', 'cancelled']),
            'payment_status' => fake()->randomElement(['pending', 'paid', 'completed', 'failed', 'refunded']),
            'payment_method' => fake()->randomElement(['credit_card', 'paypal', 'bank_transfer']),
            'shipping_method' => 'HOME',
            'subtotal' => $subtotal,
            'shipping_cost' => $shippingCost,
            'total' => $total,
            // Legacy fields for backward compatibility
            'tax_amount' => 0,
            'shipping_amount' => $shippingCost,
            'total_amount' => $total,
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