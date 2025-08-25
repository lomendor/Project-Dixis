<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create users with specific roles (idempotent)
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'role' => 'admin',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $producer = User::firstOrCreate(
            ['email' => 'producer@example.com'],
            [
                'name' => 'Producer User',
                'email' => 'producer@example.com', 
                'role' => 'producer',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $consumer = User::firstOrCreate(
            ['email' => 'consumer@example.com'],
            [
                'name' => 'Consumer User',
                'email' => 'consumer@example.com',
                'role' => 'consumer',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create demo API token for testing (local/testing environments only)
        if (app()->environment(['local', 'testing'])) {
            $token = $consumer->createToken('Demo API Token');
            \Log::info("Demo API Token for consumer@example.com: {$token->plainTextToken}");
            echo "\n🔑 Demo API Token for consumer@example.com: {$token->plainTextToken}\n";
        }

        $this->call([
            ProducerSeeder::class,
            ProductSeeder::class,
        ]);

        // Create demo orders after products exist (idempotent)
        $this->createDemoOrders($consumer);
    }

    private function createDemoOrders(User $consumer): void
    {
        // Only create demo orders if none exist for this consumer (idempotent)
        if (Order::where('user_id', $consumer->id)->exists()) {
            return;
        }

        $products = Product::take(3)->get();
        
        if ($products->count() > 0) {
            // Create first demo order
            $order1 = Order::create([
                'user_id' => $consumer->id,
                'subtotal' => 45.50,
                'tax_amount' => 4.55,
                'shipping_amount' => 5.00,
                'total_amount' => 55.05,
                'payment_status' => 'paid',
                'status' => 'completed',
                'shipping_method' => 'HOME',
            ]);

            // Add order items
            foreach ($products->take(2) as $index => $product) {
                $quantity = $index + 1;
                $unitPrice = $product->price ?? 15.00;
                OrderItem::create([
                    'order_id' => $order1->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $quantity * $unitPrice,
                    'product_name' => $product->name,
                    'product_unit' => $product->unit ?? 'kg',
                ]);
            }

            // Create second demo order (pending)
            $order2 = Order::create([
                'user_id' => $consumer->id,
                'subtotal' => 25.00,
                'tax_amount' => 2.50,
                'shipping_amount' => 3.00,
                'total_amount' => 30.50,
                'payment_status' => 'pending',
                'status' => 'pending',
                'shipping_method' => 'HOME',
            ]);

            if ($products->count() > 2) {
                $product = $products->get(2);
                OrderItem::create([
                    'order_id' => $order2->id,
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'unit_price' => $product->price ?? 25.00,
                    'total_price' => $product->price ?? 25.00,
                    'product_name' => $product->name,
                    'product_unit' => $product->unit ?? 'kg',
                ]);
            }
        }
    }
}
