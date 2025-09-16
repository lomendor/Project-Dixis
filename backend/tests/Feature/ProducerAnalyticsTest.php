<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Producer;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProducerAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private User $producerUser;
    private Producer $producer;

    protected function setUp(): void
    {
        parent::setUp();

        // Create producer user first
        $this->producerUser = User::factory()->create([
            'email' => 'producer@test.com'
        ]);

        // Create producer associated with the user
        $this->producer = Producer::factory()->create([
            'name' => 'Test Producer',
            'user_id' => $this->producerUser->id
        ]);
    }

    public function test_producer_sales_analytics_endpoint()
    {
        // Create products for this producer
        $product1 = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'price' => 10.00,
            'name' => 'Producer Product 1'
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'price' => 20.00,
            'name' => 'Producer Product 2'
        ]);

        // Create orders with producer's products
        $order1 = Order::factory()->create([
            'payment_status' => 'paid',
            'total_amount' => 30.00,
            'created_at' => now()
        ]);
        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'total_price' => 20.00
        ]);
        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'product_id' => $product2->id,
            'quantity' => 1,
            'total_price' => 20.00
        ]);

        $order2 = Order::factory()->create([
            'payment_status' => 'paid',
            'total_amount' => 20.00,
            'created_at' => now()->subDay()
        ]);
        OrderItem::factory()->create([
            'order_id' => $order2->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'total_price' => 20.00
        ]);

        $response = $this->actingAs($this->producerUser)
            ->getJson('/api/v1/producer/analytics/sales?period=daily&limit=7');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'analytics' => [
                    'period',
                    'data' => [
                        '*' => ['date', 'total_sales', 'order_count', 'average_order_value']
                    ],
                    'summary' => [
                        'total_revenue',
                        'total_orders',
                        'average_order_value',
                        'period_growth'
                    ]
                ]
            ]);

        $analytics = $response->json()['analytics'];
        $this->assertEquals('daily', $analytics['period']);
        $this->assertEquals(7, count($analytics['data']));
    }

    public function test_producer_orders_analytics_endpoint()
    {
        // Create products for this producer
        $product = Product::factory()->create([
            'producer_id' => $this->producer->id
        ]);

        // Create orders with different statuses containing producer's products
        $order1 = Order::factory()->create(['status' => 'pending']);
        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'product_id' => $product->id
        ]);

        $order2 = Order::factory()->create(['status' => 'delivered']);
        OrderItem::factory()->create([
            'order_id' => $order2->id,
            'product_id' => $product->id
        ]);

        $response = $this->actingAs($this->producerUser)
            ->getJson('/api/v1/producer/analytics/orders');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'analytics' => [
                    'by_status',
                    'by_payment_status',
                    'recent_orders',
                    'summary' => [
                        'total_orders',
                        'pending_orders',
                        'completed_orders',
                        'cancelled_orders'
                    ]
                ]
            ]);

        $analytics = $response->json()['analytics'];
        $this->assertEquals(1, $analytics['by_status']['pending']);
        $this->assertEquals(1, $analytics['by_status']['delivered']);
        $this->assertEquals(2, $analytics['summary']['total_orders']);
    }

    public function test_producer_products_analytics_endpoint()
    {
        // Create products for this producer
        $product1 = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Product A',
            'price' => 10.00
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Product B',
            'price' => 20.00
        ]);

        // Create orders with items for this producer's products
        $order = Order::factory()->create(['payment_status' => 'paid']);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product1->id,
            'quantity' => 3,
            'total_price' => 30.00
        ]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product2->id,
            'quantity' => 1,
            'total_price' => 20.00
        ]);

        $response = $this->actingAs($this->producerUser)
            ->getJson('/api/v1/producer/analytics/products?limit=5');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'analytics' => [
                    'top_products' => [
                        '*' => [
                            'id',
                            'name',
                            'price',
                            'total_quantity_sold',
                            'total_revenue',
                            'order_count'
                        ]
                    ],
                    'summary' => [
                        'total_products',
                        'active_products',
                        'out_of_stock'
                    ]
                ]
            ]);

        $topProducts = $response->json()['analytics']['top_products'];
        $this->assertCount(2, $topProducts);
        $this->assertEquals('Product A', $topProducts[0]['name']);
        $this->assertEquals(30.00, $topProducts[0]['total_revenue']);
    }

    public function test_producer_analytics_requires_authentication()
    {
        $response = $this->getJson('/api/v1/producer/analytics/sales');
        $response->assertStatus(401);

        $response = $this->getJson('/api/v1/producer/analytics/orders');
        $response->assertStatus(401);

        $response = $this->getJson('/api/v1/producer/analytics/products');
        $response->assertStatus(401);
    }

    public function test_producer_analytics_requires_producer_association()
    {
        // Create user without producer association
        $regularUser = User::factory()->create();

        $response = $this->actingAs($regularUser)
            ->getJson('/api/v1/producer/analytics/sales');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'User is not associated with a producer'
            ]);

        $response = $this->actingAs($regularUser)
            ->getJson('/api/v1/producer/analytics/orders');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'User is not associated with a producer'
            ]);

        $response = $this->actingAs($regularUser)
            ->getJson('/api/v1/producer/analytics/products');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'User is not associated with a producer'
            ]);
    }

    public function test_producer_sees_only_own_products_data()
    {
        // Create another producer with products
        $otherProducer = Producer::factory()->create(['name' => 'Other Producer']);
        $otherProduct = Product::factory()->create([
            'producer_id' => $otherProducer->id,
            'name' => 'Other Producer Product'
        ]);

        // Create product for our producer
        $myProduct = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'My Product'
        ]);

        // Create orders for both products
        $order1 = Order::factory()->create(['payment_status' => 'paid']);
        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'product_id' => $otherProduct->id,
            'total_price' => 100.00
        ]);

        $order2 = Order::factory()->create(['payment_status' => 'paid']);
        OrderItem::factory()->create([
            'order_id' => $order2->id,
            'product_id' => $myProduct->id,
            'total_price' => 50.00
        ]);

        // Test sales analytics - should only see own product sales
        $response = $this->actingAs($this->producerUser)
            ->getJson('/api/v1/producer/analytics/sales');

        $response->assertStatus(200);
        $analytics = $response->json()['analytics'];
        $this->assertEquals(50.00, $analytics['summary']['total_revenue']);

        // Test products analytics - should only see own products
        $response = $this->actingAs($this->producerUser)
            ->getJson('/api/v1/producer/analytics/products');

        $response->assertStatus(200);
        $products = $response->json()['analytics']['top_products'];
        $this->assertCount(1, $products);
        $this->assertEquals('My Product', $products[0]['name']);
        $this->assertEquals(50.00, $products[0]['total_revenue']);
    }

    public function test_producer_sales_analytics_period_validation()
    {
        $response = $this->actingAs($this->producerUser)
            ->getJson('/api/v1/producer/analytics/sales?period=invalid');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['period']);
    }

    public function test_producer_products_analytics_limit_validation()
    {
        $response = $this->actingAs($this->producerUser)
            ->getJson('/api/v1/producer/analytics/products?limit=100');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['limit']);
    }
}