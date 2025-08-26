<?php

namespace Tests\Feature\Public;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Producer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

#[Group('api')]
class OrdersCreateApiTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $producer;
    protected $product1;
    protected $product2;
    protected $inactiveProduct;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test user
        $this->user = User::factory()->create();
        
        // Create test producer
        $this->producer = Producer::factory()->create(['is_active' => true]);
        
        // Create test products
        $this->product1 = Product::factory()->create([
            'name' => 'Test Oranges',
            'price' => 10.50,
            'stock' => 100,
            'unit' => 'kg',
            'is_active' => true,
            'producer_id' => $this->producer->id,
        ]);
        
        $this->product2 = Product::factory()->create([
            'name' => 'Test Apples',
            'price' => 5.25,
            'stock' => 50,
            'unit' => 'kg',
            'is_active' => true,
            'producer_id' => $this->producer->id,
        ]);
        
        // Create inactive product
        $this->inactiveProduct = Product::factory()->create([
            'name' => 'Inactive Product',
            'price' => 8.00,
            'stock' => 20,
            'is_active' => false,
            'producer_id' => $this->producer->id,
        ]);
    }

    public function test_it_creates_order_with_items_and_totals(): void
    {
        $orderData = [
            'user_id' => $this->user->id,
            'items' => [
                [
                    'product_id' => $this->product1->id,
                    'quantity' => 2,
                ],
                [
                    'product_id' => $this->product2->id,
                    'quantity' => 3,
                ],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
            'notes' => 'Test order notes',
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'order_number',
                    'status',
                    'total',
                    'currency',
                    'created_at',
                    'items_count',
                    'items' => [
                        '*' => [
                            'product_id',
                            'product_name',
                            'quantity',
                            'unit_price',
                            'total_price',
                        ],
                    ],
                ],
            ]);

        $responseData = $response->json('data');
        
        // Verify order details
        $this->assertEquals('pending', $responseData['status']);
        $this->assertEquals(2, $responseData['items_count']);
        $this->assertEquals('EUR', $responseData['currency']);
        
        // Verify total calculation: (10.50 * 2) + (5.25 * 3) = 21.00 + 15.75 = 36.75
        $this->assertEquals('36.75', $responseData['total']);
        
        // Verify order number format
        $this->assertMatchesRegularExpression('/^ORD-\d{6}$/', $responseData['order_number']);
        
        // Verify no PII is exposed
        $this->assertArrayNotHasKey('user_id', $responseData);
        $this->assertArrayNotHasKey('shipping_address', $responseData);
        $this->assertArrayNotHasKey('billing_address', $responseData);
        
        // Verify database records
        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'status' => 'pending',
            'total' => 36.75,
            'shipping_method' => 'HOME',
            'notes' => 'Test order notes',
        ]);
        
        $this->assertDatabaseHas('order_items', [
            'product_id' => $this->product1->id,
            'quantity' => 2,
            'unit_price' => 10.50,
            'total_price' => 21.00,
            'product_name' => 'Test Oranges',
            'product_unit' => 'kg',
        ]);
        
        $this->assertDatabaseHas('order_items', [
            'product_id' => $this->product2->id,
            'quantity' => 3,
            'unit_price' => 5.25,
            'total_price' => 15.75,
            'product_name' => 'Test Apples',
            'product_unit' => 'kg',
        ]);
        
        // Verify stock was decremented
        $this->product1->refresh();
        $this->product2->refresh();
        $this->assertEquals(98, $this->product1->stock); // 100 - 2
        $this->assertEquals(47, $this->product2->stock); // 50 - 3
    }

    public function test_it_fails_when_item_product_missing(): void
    {
        $orderData = [
            'items' => [
                [
                    'product_id' => 99999, // Non-existent product
                    'quantity' => 1,
                ],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('items.0.product_id');
    }

    public function test_it_fails_when_product_is_inactive(): void
    {
        $orderData = [
            'items' => [
                [
                    'product_id' => $this->inactiveProduct->id,
                    'quantity' => 1,
                ],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(400)
            ->assertJson([
                'message' => "Product with ID {$this->inactiveProduct->id} not found or inactive.",
            ]);
    }

    public function test_it_fails_when_quantity_invalid(): void
    {
        $orderData = [
            'items' => [
                [
                    'product_id' => $this->product1->id,
                    'quantity' => 0, // Invalid quantity
                ],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('items.0.quantity');
    }

    public function test_it_returns_409_when_stock_insufficient(): void
    {
        $orderData = [
            'items' => [
                [
                    'product_id' => $this->product2->id,
                    'quantity' => 60, // More than available stock (50)
                ],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(409)
            ->assertJson([
                'message' => "Insufficient stock for product 'Test Apples'. Available: 50, requested: 60.",
            ]);
        
        // Verify stock was not decremented
        $this->product2->refresh();
        $this->assertEquals(50, $this->product2->stock);
    }

    public function test_it_uses_atomic_transaction_on_partial_failures(): void
    {
        $initialOrderCount = Order::count();
        $initialOrderItemCount = OrderItem::count();
        $initialProduct1Stock = $this->product1->stock;
        $initialProduct2Stock = $this->product2->stock;
        
        $orderData = [
            'items' => [
                [
                    'product_id' => $this->product1->id,
                    'quantity' => 2, // Valid
                ],
                [
                    'product_id' => $this->product2->id,
                    'quantity' => 60, // Invalid - exceeds stock
                ],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(409); // Should fail due to insufficient stock
        
        // Verify no records were created (transaction was rolled back)
        $this->assertEquals($initialOrderCount, Order::count());
        $this->assertEquals($initialOrderItemCount, OrderItem::count());
        
        // Verify no stock was decremented (transaction was rolled back)
        $this->product1->refresh();
        $this->product2->refresh();
        $this->assertEquals($initialProduct1Stock, $this->product1->stock);
        $this->assertEquals($initialProduct2Stock, $this->product2->stock);
    }

    public function test_it_returns_201_and_resource_shape_without_pii(): void
    {
        $orderData = [
            'user_id' => $this->user->id,
            'items' => [
                [
                    'product_id' => $this->product1->id,
                    'quantity' => 1,
                ],
            ],
            'currency' => 'USD',
            'shipping_method' => 'PICKUP',
            'notes' => null,
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
        
        $responseData = $response->json('data');
        
        // Verify required fields are present
        $requiredFields = ['id', 'order_number', 'status', 'total', 'currency', 'created_at', 'items_count', 'items'];
        foreach ($requiredFields as $field) {
            $this->assertArrayHasKey($field, $responseData);
        }
        
        // Verify PII fields are NOT present
        $piiFields = ['user_id', 'email', 'phone', 'shipping_address', 'billing_address', 'payment_method'];
        foreach ($piiFields as $field) {
            $this->assertArrayNotHasKey($field, $responseData);
        }
        
        // Verify currency was saved correctly
        $this->assertEquals('USD', $responseData['currency']);
        
        // Verify items structure
        $this->assertIsArray($responseData['items']);
        $this->assertCount(1, $responseData['items']);
        
        $item = $responseData['items'][0];
        $this->assertArrayHasKey('product_id', $item);
        $this->assertArrayHasKey('product_name', $item);
        $this->assertArrayHasKey('quantity', $item);
        $this->assertArrayHasKey('unit_price', $item);
        $this->assertArrayHasKey('total_price', $item);
    }

    public function test_it_validates_required_fields(): void
    {
        // Test missing items
        $response = $this->postJson('/api/v1/orders', [
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors('items');

        // Test invalid currency
        $response = $this->postJson('/api/v1/orders', [
            'items' => [['product_id' => $this->product1->id, 'quantity' => 1]],
            'currency' => 'GBP', // Invalid currency
            'shipping_method' => 'HOME',
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors('currency');

        // Test invalid shipping method
        $response = $this->postJson('/api/v1/orders', [
            'items' => [['product_id' => $this->product1->id, 'quantity' => 1]],
            'currency' => 'EUR',
            'shipping_method' => 'DELIVERY', // Invalid shipping method
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors('shipping_method');

        // Test empty items array
        $response = $this->postJson('/api/v1/orders', [
            'items' => [], // Empty array
            'currency' => 'EUR',
            'shipping_method' => 'HOME',
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors('items');
    }

    public function test_it_creates_order_without_user_id(): void
    {
        $orderData = [
            // No user_id - public checkout
            'items' => [
                [
                    'product_id' => $this->product1->id,
                    'quantity' => 1,
                ],
            ],
            'currency' => 'EUR',
            'shipping_method' => 'PICKUP',
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
        
        // Verify order was created without user_id
        $this->assertDatabaseHas('orders', [
            'user_id' => null,
            'status' => 'pending',
            'shipping_method' => 'PICKUP',
        ]);
    }
}