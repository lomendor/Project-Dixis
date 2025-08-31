<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Producer;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have products to create order items with
        if (Product::count() === 0) {
            $this->call(ProductSeeder::class);
        }

        // Only create orders if we don't have enough already (idempotent)
        if (Order::count() < 10) {
            $existingOrderCount = Order::count();
            $ordersToCreate = 10 - $existingOrderCount;
            
            for ($i = 0; $i < $ordersToCreate; $i++) {
                $this->createOrderWithItems();
            }
        }
    }

    private function createOrderWithItems(): void
    {
        // Get available products
        $products = Product::with('producer')->get();
        
        if ($products->isEmpty()) {
            // Fallback: create some basic products if none exist
            $this->call(ProductSeeder::class);
            $products = Product::with('producer')->get();
        }

        // Create order
        $subtotal = 0;
        $shippingCost = fake()->randomFloat(2, 0, 5);
        
        $order = Order::create([
            'user_id' => null, // nullable as specified
            'status' => fake()->randomElement(['pending', 'processing', 'shipped', 'completed', 'cancelled']), // Use current valid enum values
            'payment_status' => fake()->randomElement(['pending', 'paid', 'failed']),
            'payment_method' => fake()->randomElement(['credit_card', 'paypal', 'bank_transfer']),
            'shipping_method' => 'HOME',
            'subtotal' => 0, // Will be calculated after items
            'shipping_cost' => $shippingCost,
            'total' => 0, // Will be calculated after items
            // Legacy fields for compatibility
            'tax_amount' => 0,
            'shipping_amount' => $shippingCost,
            'total_amount' => 0,
        ]);

        // Create 2-4 order items for this order
        $itemCount = fake()->numberBetween(2, 4);
        $randomProducts = $products->random(min($itemCount, $products->count()));
        
        foreach ($randomProducts as $product) {
            $quantity = fake()->numberBetween(1, 3);
            $unitPrice = $product->price ?? fake()->randomFloat(2, 5, 25);
            $totalPrice = $quantity * $unitPrice;
            $subtotal += $totalPrice;

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'producer_id' => $product->producer_id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
                'product_name' => $product->name,
                'product_unit' => $product->unit ?? 'piece',
            ]);
        }

        // Update order totals
        $total = $subtotal + $shippingCost;
        $order->update([
            'subtotal' => $subtotal,
            'total' => $total,
            // Legacy fields
            'total_amount' => $total,
        ]);
    }
}
