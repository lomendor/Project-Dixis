<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
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
            $consumerToken = $consumer->createToken('Demo Consumer API Token');
            $producerToken = $producer->createToken('Demo Producer API Token');
            \Log::info("Demo Consumer Token: {$consumerToken->plainTextToken}");
            \Log::info("Demo Producer Token: {$producerToken->plainTextToken}");
            echo "\n🔑 FRONTEND SMOKE TESTING CREDENTIALS:\n";
            echo "   Consumer: consumer@example.com / password\n";
            echo "   Producer: producer@example.com / password\n";
            echo "   Admin: admin@example.com / password\n";
            echo "   Consumer Token: {$consumerToken->plainTextToken}\n";
            echo "   Producer Token: {$producerToken->plainTextToken}\n\n";
        }

        $this->call([
            ProducerSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            OrderSeeder::class, // New structured order seeder
        ]);

        // E2E deterministic data for testing and local environments
        if (app()->environment(['testing', 'local'])) {
            $this->call([
                E2ESeeder::class,
            ]);
        }

        // Create demo orders after products exist (idempotent)
        $this->createDemoOrders($consumer);
        $this->createEnhancedDemoOrders();
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

    private function createEnhancedDemoOrders(): void
    {
        // Skip if we already have many orders (idempotent)
        if (Order::count() > 10) {
            return;
        }

        $products = Product::with('producer')->get();
        if ($products->isEmpty()) {
            return;
        }

        // Create additional demo customers
        $customers = collect();
        for ($i = 1; $i <= 5; $i++) {
            $customer = User::firstOrCreate(
                ['email' => "customer{$i}@demo.com"],
                [
                    'name' => "Demo Customer {$i}",
                    'email' => "customer{$i}@demo.com",
                    'role' => 'consumer',
                    'password' => bcrypt('password'),
                    'email_verified_at' => now(),
                ]
            );
            $customers->push($customer);
        }

        // Create orders for different time periods (last 3 months)
        $orderData = [
            // Recent orders (this month)
            ['days_ago' => 5, 'orders' => 3],
            ['days_ago' => 10, 'orders' => 2],
            ['days_ago' => 15, 'orders' => 4],

            // Last month
            ['days_ago' => 35, 'orders' => 5],
            ['days_ago' => 45, 'orders' => 3],
            ['days_ago' => 50, 'orders' => 2],

            // Two months ago
            ['days_ago' => 65, 'orders' => 4],
            ['days_ago' => 75, 'orders' => 3],

            // Three months ago
            ['days_ago' => 90, 'orders' => 2],
        ];

        foreach ($orderData as $period) {
            for ($i = 0; $i < $period['orders']; $i++) {
                $customer = $customers->random();
                $orderDate = now()->subDays($period['days_ago'])->addHours(rand(-12, 12));

                // Create order with realistic data
                $subtotal = 0;
                $selectedProducts = $products->random(rand(1, 4));

                $order = Order::create([
                    'user_id' => $customer->id,
                    'subtotal' => 0, // Will calculate below
                    'tax_amount' => 0,
                    'shipping_amount' => collect(['HOME', 'PICKUP', 'COURIER'])->random() === 'PICKUP' ? 0 : 5.00,
                    'total_amount' => 0,
                    'payment_status' => collect(['paid', 'paid', 'completed', 'pending', 'failed'])->random(), // Updated for new constraints
                    'status' => collect(['completed', 'completed', 'shipped', 'confirmed', 'pending'])->random(),
                    'shipping_method' => collect(['HOME', 'PICKUP', 'COURIER'])->random(),
                    'notes' => rand(0, 1) ? "Demo order notes #{$i}" : null,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate->copy()->addHours(rand(1, 48)),
                ]);

                // Create order items
                foreach ($selectedProducts as $product) {
                    $quantity = rand(1, 5);
                    $unitPrice = $product->price;
                    $totalPrice = $quantity * $unitPrice;
                    $subtotal += $totalPrice;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'total_price' => $totalPrice,
                        'product_name' => $product->name,
                        'product_unit' => $product->unit ?? 'unit',
                        'created_at' => $orderDate,
                        'updated_at' => $orderDate,
                    ]);
                }

                // Update order totals
                $taxAmount = $subtotal * 0.10; // 10% tax
                $totalAmount = $subtotal + $taxAmount + $order->shipping_amount;

                $order->update([
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount,
                ]);
            }
        }

        // Create some messages for producers to test unread_messages KPI
        $this->createDemoMessages();
    }

    private function createDemoMessages(): void
    {
        $producers = \App\Models\Producer::all();
        $customers = User::where('role', 'consumer')->get();

        // If no customers exist, create some
        if ($customers->isEmpty()) {
            for ($i = 1; $i <= 3; $i++) {
                $customer = User::firstOrCreate(
                    ['email' => "message-customer{$i}@demo.com"],
                    [
                        'name' => "Message Customer {$i}",
                        'email' => "message-customer{$i}@demo.com",
                        'role' => 'consumer',
                        'password' => bcrypt('password'),
                        'email_verified_at' => now(),
                    ]
                );
                $customers->push($customer);
            }
        }

        foreach ($producers as $producer) {
            // Skip if producer already has messages (idempotent)
            if (\App\Models\Message::where('producer_id', $producer->id)->exists()) {
                continue;
            }

            // Create some messages with mix of read/unread
            for ($i = 0; $i < rand(2, 5); $i++) {
                $customer = $customers->random();
                \App\Models\Message::create([
                    'user_id' => $customer->id,
                    'producer_id' => $producer->id,
                    'content' => 'This is a demo message for testing KPI functionality. Message #'.($i + 1).' from customer.',
                    'is_read' => rand(0, 1) == 1, // 50% chance of being read
                    'created_at' => now()->subDays(rand(1, 30)),
                ]);
            }
        }
    }
}
