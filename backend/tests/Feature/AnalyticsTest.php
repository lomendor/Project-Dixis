<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Producer;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user for authentication
        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@test.com'
        ]);
    }

    public function test_sales_analytics_endpoint()
    {
        // Create some test orders with different dates
        Order::factory()->count(5)->create([
            'payment_status' => 'paid',
            'total_amount' => 100.00,
            'created_at' => now()
        ]);

        Order::factory()->count(3)->create([
            'payment_status' => 'paid',
            'total_amount' => 50.00,
            'created_at' => now()->subDay()
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/admin/analytics/sales?period=daily&limit=7');

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

    public function test_orders_analytics_endpoint()
    {
        // Create orders with different statuses
        Order::factory()->count(3)->create(['status' => 'pending']);
        Order::factory()->count(2)->create(['status' => 'delivered']);
        Order::factory()->count(1)->create(['status' => 'cancelled']);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/admin/analytics/orders');

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
        $this->assertEquals(3, $analytics['by_status']['pending']);
        $this->assertEquals(2, $analytics['by_status']['delivered']);
        $this->assertEquals(1, $analytics['by_status']['cancelled']);
        $this->assertEquals(6, $analytics['summary']['total_orders']);
    }

    public function test_products_analytics_endpoint()
    {
        // Create producer with products
        $producer = Producer::factory()->create();
        $product1 = Product::factory()->create([
            'producer_id' => $producer->id,
            'name' => 'Product A',
            'price' => 10.00
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer->id,
            'name' => 'Product B',
            'price' => 20.00
        ]);

        // Create orders with items
        $order = Order::factory()->create(['payment_status' => 'paid']);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product1->id,
            'quantity' => 5,
            'total_price' => 50.00
        ]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product2->id,
            'quantity' => 2,
            'total_price' => 40.00
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/admin/analytics/products?limit=5');

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
        $this->assertEquals(50.00, $topProducts[0]['total_revenue']);
    }

    public function test_producers_analytics_endpoint()
    {
        // Create producers with products and orders
        $producer1 = Producer::factory()->create(['name' => 'Producer A']);
        $producer2 = Producer::factory()->create(['name' => 'Producer B']);

        $product1 = Product::factory()->create([
            'producer_id' => $producer1->id,
            'is_active' => true
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'is_active' => true
        ]);

        $order = Order::factory()->create(['payment_status' => 'paid']);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product1->id,
            'total_price' => 100.00
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/admin/analytics/producers');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'analytics' => [
                    'active_producers',
                    'total_producers',
                    'top_producers' => [
                        '*' => [
                            'id',
                            'name',
                            'location',
                            'product_count',
                            'total_revenue',
                            'order_count'
                        ]
                    ]
                ]
            ]);

        $analytics = $response->json()['analytics'];
        $this->assertEquals(2, $analytics['active_producers']);
        $this->assertEquals(2, $analytics['total_producers']);
    }

    public function test_dashboard_summary_endpoint()
    {
        // Create various data for dashboard
        Order::factory()->count(3)->create([
            'payment_status' => 'paid',
            'total_amount' => 100.00,
            'created_at' => now()
        ]);

        Order::factory()->count(2)->create([
            'payment_status' => 'paid',
            'total_amount' => 50.00,
            'created_at' => now()->subMonth()
        ]);

        User::factory()->count(5)->create();
        Producer::factory()->count(3)->create();
        Product::factory()->count(10)->create(['is_active' => true]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/admin/analytics/dashboard');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'summary' => [
                    'today' => [
                        'sales',
                        'orders',
                        'average_order_value'
                    ],
                    'month' => [
                        'sales',
                        'orders',
                        'average_order_value',
                        'sales_growth',
                        'orders_growth'
                    ],
                    'totals' => [
                        'users',
                        'producers',
                        'products',
                        'lifetime_revenue'
                    ]
                ]
            ]);

        $summary = $response->json()['summary'];
        $this->assertEquals(300.00, $summary['today']['sales']);
        $this->assertEquals(3, $summary['today']['orders']);
        $this->assertGreaterThan(0, $summary['totals']['users']);
        $this->assertEquals(10, $summary['totals']['products']);
    }

    public function test_analytics_requires_authentication()
    {
        $response = $this->getJson('/api/v1/admin/analytics/sales');
        $response->assertStatus(401);

        $response = $this->getJson('/api/v1/admin/analytics/orders');
        $response->assertStatus(401);

        $response = $this->getJson('/api/v1/admin/analytics/products');
        $response->assertStatus(401);

        $response = $this->getJson('/api/v1/admin/analytics/dashboard');
        $response->assertStatus(401);
    }

    public function test_sales_analytics_period_validation()
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/admin/analytics/sales?period=invalid');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['period']);
    }

    public function test_products_analytics_limit_validation()
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/admin/analytics/products?limit=100');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['limit']);
    }
}