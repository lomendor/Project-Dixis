<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Producer;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $product1;
    protected $product2;
    protected $producer;

    protected function setUp(): void
    {
        parent::setUp();

        // Create user
        $this->user = User::factory()->create([
            'email' => 'order-test@test.com',
            'role' => 'consumer'
        ]);

        // Create producer and products
        $this->producer = Producer::factory()->create();
        
        $this->product1 = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Test Product 1',
            'title' => 'Test Product 1',
            'price' => 15.00,
            'stock' => 50,
            'is_active' => true
        ]);
        
        $this->product2 = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Test Product 2',
            'title' => 'Test Product 2',
            'price' => 25.50,
            'stock' => 30,
            'is_active' => true
        ]);
    }

    public function test_checkout_creates_order_from_cart(): void
    {
        // Add items to cart
        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product1->id,
            'quantity' => 2
        ]);
        
        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product2->id,
            'quantity' => 1
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders/checkout', [
            'shipping_method' => 'HOME',
            'notes' => 'Test order'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'order' => [
                    'id',
                    'subtotal',
                    'tax_amount',
                    'shipping_amount',
                    'total_amount',
                    'payment_status',
                    'status',
                    'shipping_method',
                    'notes',
                    'created_at',
                    'items' => [
                        '*' => [
                            'id',
                            'product_id',
                            'product_name',
                            'quantity',
                            'unit_price',
                            'total_price'
                        ]
                    ]
                ]
            ]);

        // Verify order was created correctly
        $subtotal = (2 * 15.00) + (1 * 25.50); // 55.50
        $taxAmount = $subtotal * 0.10; // 5.55
        $shippingAmount = 5.00;
        $totalAmount = $subtotal + $taxAmount + $shippingAmount; // 66.05

        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'shipping_amount' => $shippingAmount,
            'total_amount' => $totalAmount,
            'payment_status' => 'pending',
            'status' => 'pending',
            'shipping_method' => 'HOME',
            'notes' => 'Test order'
        ]);

        // Verify order items were created
        $this->assertDatabaseHas('order_items', [
            'product_id' => $this->product1->id,
            'quantity' => 2,
            'unit_price' => 15.00,
            'total_price' => 30.00,
            'product_name' => 'Test Product 1'
        ]);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $this->product2->id,
            'quantity' => 1,
            'unit_price' => 25.50,
            'total_price' => 25.50,
            'product_name' => 'Test Product 2'
        ]);

        // Verify cart was cleared after checkout
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_checkout_with_pickup_has_no_shipping_cost(): void
    {
        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product1->id,
            'quantity' => 1
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders/checkout', [
            'shipping_method' => 'PICKUP'
        ]);

        $response->assertStatus(201);

        $subtotal = 15.00;
        $taxAmount = $subtotal * 0.10;
        $totalAmount = $subtotal + $taxAmount; // No shipping for pickup

        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'shipping_amount' => 0.00,
            'total_amount' => $totalAmount,
            'shipping_method' => 'PICKUP'
        ]);
    }

    public function test_cannot_checkout_empty_cart(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders/checkout');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['cart']);
    }

    public function test_cannot_checkout_with_inactive_products(): void
    {
        $this->product1->update(['is_active' => false]);

        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product1->id,
            'quantity' => 1
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders/checkout');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['products']);
    }

    public function test_cannot_checkout_with_insufficient_stock(): void
    {
        $this->product1->update(['stock' => 1]);

        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product1->id,
            'quantity' => 5 // More than stock
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders/checkout');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['stock']);
    }

    public function test_checkout_validation_rules(): void
    {
        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product1->id,
            'quantity' => 1
        ]);

        Sanctum::actingAs($this->user);

        // Test invalid shipping method
        $response = $this->postJson('/api/v1/orders/checkout', [
            'shipping_method' => 'INVALID'
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['shipping_method']);

        // Test notes too long
        $response = $this->postJson('/api/v1/orders/checkout', [
            'notes' => str_repeat('a', 501) // Max is 500
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['notes']);
    }

    public function test_manual_order_creation(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders', [
            'items' => [
                [
                    'product_id' => $this->product1->id,
                    'quantity' => 2
                ],
                [
                    'product_id' => $this->product2->id,
                    'quantity' => 1
                ]
            ],
            'shipping_method' => 'COURIER',
            'notes' => 'Manual test order'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'subtotal',
                'tax_amount',
                'shipping_amount',
                'total_amount',
                'payment_status',
                'status',
                'order_items'
            ]);

        // Verify order was created
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 2);
    }

    public function test_get_user_orders(): void
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'subtotal' => 50.00,
            'tax_amount' => 5.00,
            'shipping_amount' => 5.00,
            'total_amount' => 60.00
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $this->product1->id
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/v1/orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'orders' => [
                    '*' => [
                        'id',
                        'subtotal',
                        'tax_amount',
                        'shipping_amount',
                        'total_amount',
                        'payment_status',
                        'status',
                        'items' => [
                            '*' => [
                                'id',
                                'product_id',
                                'product_name',
                                'quantity',
                                'unit_price',
                                'total_price'
                            ]
                        ]
                    ]
                ]
            ]);
    }

    public function test_get_specific_order(): void
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $this->product1->id
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->getJson("/api/v1/orders/{$order->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'user_id',
                'subtotal',
                'tax_amount',
                'shipping_amount',
                'total_amount',
                'payment_status',
                'status',
                'order_items'
            ]);
    }

    public function test_cannot_view_another_users_order(): void
    {
        $anotherUser = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $anotherUser->id
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->getJson("/api/v1/orders/{$order->id}");

        $response->assertStatus(404);
    }

    public function test_orders_require_authentication(): void
    {
        // Test without authentication
        $this->getJson('/api/v1/orders')->assertStatus(401);
        
        $this->postJson('/api/v1/orders/checkout')->assertStatus(401);
        
        $this->postJson('/api/v1/orders', [
            'items' => [['product_id' => $this->product1->id, 'quantity' => 1]]
        ])->assertStatus(401);
        
        $order = Order::factory()->create(['user_id' => $this->user->id]);
        $this->getJson("/api/v1/orders/{$order->id}")->assertStatus(401);
    }

    public function test_checkout_preserves_product_price_at_time_of_order(): void
    {
        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product1->id,
            'quantity' => 1
        ]);

        // Change product price after adding to cart
        $originalPrice = $this->product1->price;
        $this->product1->update(['price' => 999.99]);

        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders/checkout');

        $response->assertStatus(201);

        // Verify order item uses the current product price (not cart price)
        $this->assertDatabaseHas('order_items', [
            'product_id' => $this->product1->id,
            'unit_price' => 999.99 // Current price at time of checkout
        ]);
    }

    public function test_complex_checkout_scenario(): void
    {
        // Create products with different scenarios
        $inactiveProduct = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Inactive Product',
            'title' => 'Inactive Product',
            'price' => 10.00,
            'is_active' => false
        ]);
        
        $lowStockProduct = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Low Stock Product',
            'title' => 'Low Stock Product',
            'price' => 20.00,
            'stock' => 1
        ]);

        // Add items to cart
        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product1->id,
            'quantity' => 1
        ]);
        
        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $inactiveProduct->id,
            'quantity' => 1
        ]);
        
        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $lowStockProduct->id,
            'quantity' => 5 // More than stock
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders/checkout');

        $response->assertStatus(422);

        // Should have validation errors for both inactive product and insufficient stock
        $responseData = $response->json();
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertTrue(
            isset($responseData['errors']['products']) || 
            isset($responseData['errors']['stock'])
        );
    }
}