<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 3);
        $unitPrice = fake()->randomFloat(2, 5, 25);
        $totalPrice = $unitPrice * $quantity;

        // Get a product with producer to derive producer_id
        $product = Product::inRandomOrder()->first() ?? Product::factory()->create();

        return [
            'order_id' => Order::factory(),
            'product_id' => $product->id,
            'producer_id' => $product->producer_id, // CRITICAL: derive from product
            'quantity' => $quantity,
            'unit_price' => $product->price ?? $unitPrice,
            'total_price' => ($product->price ?? $unitPrice) * $quantity,
            'product_name' => $product->name ?? fake()->words(2, true),
            'product_unit' => $product->unit ?? fake()->randomElement(['kg', 'piece', 'bottle', 'box']),
        ];
    }

    /**
     * Configure the factory to use a specific product.
     */
    public function forProduct(Product $product): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $product->id,
            'producer_id' => $product->producer_id,
            'product_name' => $product->name,
            'product_unit' => $product->unit ?? 'piece',
            'unit_price' => $product->price,
            'total_price' => $product->price * $attributes['quantity'],
        ]);
    }
}
