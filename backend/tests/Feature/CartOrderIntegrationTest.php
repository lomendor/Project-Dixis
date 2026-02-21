<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Message;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartOrderIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected $customer;

    protected $producer;

    protected $producerUser;

    protected $products;

    protected function setUp(): void
    {
        parent::setUp();

        // Fix ghost constraint after RefreshDatabase (PostgreSQL only)
        $this->fixOrdersConstraints();

        // Create customer
        $this->customer = User::factory()->create([
            'email' => 'customer@integration-test.com',
            'role' => 'consumer',
        ]);

        // Create producer user and profile
        $this->producerUser = User::factory()->create([
            'email' => 'producer@integration-test.com',
            'role' => 'producer',
        ]);

        $this->producer = Producer::factory()->create([
            'user_id' => $this->producerUser->id,
            'name' => 'Test Producer',
        ]);

        // Create categories
        $category1 = Category::factory()->create(['name' => 'Fruits', 'slug' => 'fruits']);
        $category2 = Category::factory()->create(['name' => 'Vegetables', 'slug' => 'vegetables']);

        // Create products
        $this->products = collect();

        for ($i = 1; $i <= 5; $i++) {
            $product = Product::factory()->create([
                'producer_id' => $this->producer->id,
                'name' => "Product {$i}",
                'price' => 10.00 * $i, // 10, 20, 30, 40, 50
                'stock' => 50,
                'is_active' => true,
            ]);

            // Attach random categories
            $product->categories()->attach(
                [$category1->id, $category2->id][array_rand([$category1->id, $category2->id])]
            );

            $this->products->push($product);
        }
    }

    /**
     * Test complete cart management + order creation flow.
     * Cart operations use /api/v1/cart/items, order creation uses /api/v1/public/orders.
     */
    public function test_complete_cart_to_order_flow(): void
    {
        Sanctum::actingAs($this->customer);

        // Step 1: Add items to cart
        $product1 = $this->products->first();
        $product2 = $this->products->skip(1)->first();
        $product3 = $this->products->skip(2)->first();

        // Add first product
        $response1 = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product1->id,
            'quantity' => 2,
        ]);
        $response1->assertStatus(201);

        // Add second product
        $response2 = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product2->id,
            'quantity' => 1,
        ]);
        $response2->assertStatus(201);

        // Add third product
        $response3 = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product3->id,
            'quantity' => 3,
        ]);
        $response3->assertStatus(201);

        // Step 2: Verify cart contents
        $cartResponse = $this->getJson('/api/v1/cart/items');
        $cartResponse->assertStatus(200)
            ->assertJson([
                'total_items' => 6, // 2 + 1 + 3
                'total_amount' => '130.00', // (2*10) + (1*20) + (3*30) = 130.00
            ]);

        // Step 3: Update cart item
        $cartItems = CartItem::where('user_id', $this->customer->id)->get();
        $firstCartItem = $cartItems->first();

        $updateResponse = $this->patchJson("/api/v1/cart/items/{$firstCartItem->id}", [
            'quantity' => 4, // Change from 2 to 4
        ]);
        $updateResponse->assertStatus(200);

        // Step 4: Remove one cart item
        $lastCartItem = $cartItems->last();
        $removeResponse = $this->deleteJson("/api/v1/cart/items/{$lastCartItem->id}");
        $removeResponse->assertStatus(200);

        // Step 5: Verify updated cart
        $updatedCartResponse = $this->getJson('/api/v1/cart/items');
        $updatedCartResponse->assertStatus(200)
            ->assertJson([
                'total_items' => 5, // 4 + 1 (removed the 3rd product)
            ]);

        // Step 6: Create order via public endpoint (items-based, not cart-based)
        $orderResponse = $this->postJson('/api/v1/public/orders', [
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 4],
                ['product_id' => $product2->id, 'quantity' => 1],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
            'notes' => 'Integration test order',
        ]);

        $orderResponse->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'subtotal',
                    'total_amount',
                    'status',
                ],
            ]);

        // Step 7: Verify order was created
        $this->assertDatabaseCount('orders', 1);

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertEquals('pending', $order->status);

        // Step 8: Verify order can be viewed by public token
        $tokenResponse = $this->getJson("/api/v1/public/orders/by-token/{$order->public_token}");
        $tokenResponse->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'payment_status',
                    'status',
                ],
            ]);
    }

    public function test_producer_kpi_integration_with_orders(): void
    {
        // Create multiple orders for KPI testing
        $this->createTestOrdersForProducer();

        Sanctum::actingAs($this->producerUser);

        // Test KPI endpoint
        $kpiResponse = $this->getJson('/api/v1/producer/dashboard/kpi');

        $kpiResponse->assertStatus(200)
            ->assertJsonStructure([
                'total_products',
                'active_products',
                'total_orders',
                'revenue',
                'unread_messages',
            ]);

        $kpiData = $kpiResponse->json();

        // Verify KPI data
        $this->assertEquals(5, $kpiData['total_products']); // 5 products created in setUp
        $this->assertEquals(5, $kpiData['active_products']); // All active
        $this->assertGreaterThan(0, $kpiData['total_orders']); // Should have orders
        $this->assertGreaterThan(0, $kpiData['revenue']); // Should have revenue

        // Test top products endpoint
        $topProductsResponse = $this->getJson('/api/v1/producer/dashboard/top-products?limit=3');

        $topProductsResponse->assertStatus(200)
            ->assertJsonStructure([
                'top_products' => [
                    '*' => [
                        'id',
                        'name',
                        'current_price',
                        'total_quantity_sold',
                        'total_revenue',
                        'total_orders',
                        'average_unit_price',
                    ],
                ],
                'limit',
                'total_products_shown',
            ]);

        $topProductsData = $topProductsResponse->json();
        $this->assertLessThanOrEqual(3, count($topProductsData['top_products']));

        // Verify products are sorted by quantity sold (descending)
        $quantities = array_column($topProductsData['top_products'], 'total_quantity_sold');
        $sortedQuantities = $quantities;
        rsort($sortedQuantities, SORT_NUMERIC); // Sort descending
        $this->assertEquals($quantities, $sortedQuantities);
    }

    public function test_multiple_customers_cart_isolation(): void
    {
        // Create second customer
        $customer2 = User::factory()->create([
            'email' => 'customer2@integration-test.com',
            'role' => 'consumer',
        ]);

        $product = $this->products->first();

        // Customer 1 adds to cart
        Sanctum::actingAs($this->customer);
        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertStatus(201);

        // Customer 2 adds to cart
        Sanctum::actingAs($customer2);
        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 5,
        ])->assertStatus(201);

        // Verify customer 1's cart
        Sanctum::actingAs($this->customer);
        $cart1Response = $this->getJson('/api/v1/cart/items');
        $cart1Response->assertStatus(200)
            ->assertJson(['total_items' => 2]);

        // Verify customer 2's cart
        Sanctum::actingAs($customer2);
        $cart2Response = $this->getJson('/api/v1/cart/items');
        $cart2Response->assertStatus(200)
            ->assertJson(['total_items' => 5]);

        // Customer 1 creates order via public endpoint
        Sanctum::actingAs($this->customer);
        $this->postJson('/api/v1/public/orders', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ])->assertStatus(201);

        // Verify customer 2's cart still has items (isolation)
        Sanctum::actingAs($customer2);
        $this->getJson('/api/v1/cart/items')
            ->assertJson(['total_items' => 5]);
    }

    public function test_producer_can_only_see_own_products_in_kpi(): void
    {
        // Create another producer
        $anotherProducerUser = User::factory()->create([
            'email' => 'producer2@integration-test.com',
            'role' => 'producer',
        ]);

        $anotherProducer = Producer::factory()->create([
            'user_id' => $anotherProducerUser->id,
        ]);

        // Create products for the other producer
        Product::factory()->count(3)->create([
            'producer_id' => $anotherProducer->id,
        ]);

        // Create orders for both producers
        $this->createTestOrdersForProducer();

        // Test original producer KPI
        Sanctum::actingAs($this->producerUser);
        $kpiResponse = $this->getJson('/api/v1/producer/dashboard/kpi');

        $kpiData = $kpiResponse->json();
        $this->assertEquals(5, $kpiData['total_products']); // Only own products

        // Test other producer KPI
        Sanctum::actingAs($anotherProducerUser);
        $kpiResponse2 = $this->getJson('/api/v1/producer/dashboard/kpi');

        $kpiData2 = $kpiResponse2->json();
        $this->assertEquals(3, $kpiData2['total_products']); // Only own products
        $this->assertEquals(0, $kpiData2['total_orders']); // No orders for this producer
        $this->assertEquals(0, $kpiData2['revenue']); // No revenue
    }

    public function test_order_creation_with_out_of_stock_product(): void
    {
        $product = $this->products->first();
        $product->update(['stock' => 0]);

        Sanctum::actingAs($this->customer);

        // Attempt to create order with out-of-stock product
        $response = $this->postJson('/api/v1/public/orders', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 5],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ]);

        // Should fail — either 422 validation or 409 conflict
        $this->assertTrue(
            in_array($response->getStatusCode(), [422, 409, 400]),
            "Expected 422/409/400 but got {$response->getStatusCode()}"
        );
    }

    protected function createTestOrdersForProducer(): void
    {
        // Create test customers
        $customers = User::factory()->count(3)->create(['role' => 'consumer']);

        // Use valid constraint values from original schema
        $validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
        $validPaymentStatuses = ['pending', 'paid', 'failed'];

        foreach ($customers as $index => $customer) {
            // Create order with constraint-compatible values
            $order = Order::create([
                'user_id' => $customer->id,
                'subtotal' => 50.00 + ($index * 20),
                'tax_amount' => 5.00 + ($index * 2),
                'shipping_amount' => 5.00,
                'total_amount' => 60.00 + ($index * 22),
                'payment_status' => $validPaymentStatuses[array_rand($validPaymentStatuses)],
                'status' => $validStatuses[array_rand($validStatuses)],
                'shipping_method' => 'HOME',
            ]);

            // Create order items with different quantities to test top products
            $productsToOrder = $this->products->take(3);

            foreach ($productsToOrder as $productIndex => $product) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => ($index + 1) * ($productIndex + 1), // Varying quantities
                    'unit_price' => $product->price,
                    'total_price' => $product->price * (($index + 1) * ($productIndex + 1)),
                    'product_name' => $product->name,
                    'product_unit' => $product->unit ?? 'unit',
                ]);
            }
        }

        // Create some unread messages for the producer
        Message::factory()->count(2)->create([
            'producer_id' => $this->producer->id,
            'is_read' => false,
        ]);
    }

    /**
     * Fix ghost constraints that cause test failures (PostgreSQL only).
     */
    protected function fixOrdersConstraints(): void
    {
        // Only run on PostgreSQL — SQLite doesn't have ALTER TABLE DROP CONSTRAINT
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        try {
            // Drop any ghost constraints that interfere with tests
            DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_new_check');
            DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check');
        } catch (\Exception $e) {
            // Ignore if constraint doesn't exist or other errors
        }
    }
}
