<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProducerOrderManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $producerUser;
    private Producer $producer;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a user first, then associate producer
        $this->producerUser = User::factory()->create();
        $this->producer = Producer::factory()->create([
            'user_id' => $this->producerUser->id,
        ]);

        // Create a product for this producer
        $this->product = Product::factory()->create([
            'producer_id' => $this->producer->id,
        ]);
    }

    public function test_producer_can_list_their_orders()
    {
        // Create an order with this producer's product
        $order = Order::factory()->create(['status' => 'pending']);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'producer_id' => $this->producer->id,
        ]);

        Sanctum::actingAs($this->producerUser);

        $response = $this->getJson('/api/v1/producer/orders');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'orders' => [
                    '*' => ['id', 'status', 'total', 'created_at'],
                ],
                'meta' => ['total', 'pending', 'processing', 'shipped', 'delivered'],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('meta.pending', 1);
    }

    public function test_producer_cannot_see_orders_without_their_products()
    {
        // Create another producer
        $otherProducer = Producer::factory()->create();
        $otherProduct = Product::factory()->create(['producer_id' => $otherProducer->id]);

        // Create an order with the other producer's product only
        $order = Order::factory()->create();
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $otherProduct->id,
            'producer_id' => $otherProducer->id,
        ]);

        Sanctum::actingAs($this->producerUser);

        $response = $this->getJson('/api/v1/producer/orders');

        $response->assertOk()
            ->assertJsonPath('meta.total', 0);
    }

    public function test_producer_can_filter_orders_by_status()
    {
        // Create orders with different statuses
        $pendingOrder = Order::factory()->create(['status' => 'pending']);
        OrderItem::factory()->create([
            'order_id' => $pendingOrder->id,
            'product_id' => $this->product->id,
            'producer_id' => $this->producer->id,
        ]);

        $processingOrder = Order::factory()->create(['status' => 'processing']);
        OrderItem::factory()->create([
            'order_id' => $processingOrder->id,
            'product_id' => $this->product->id,
            'producer_id' => $this->producer->id,
        ]);

        Sanctum::actingAs($this->producerUser);

        $response = $this->getJson('/api/v1/producer/orders?status=pending');

        $response->assertOk()
            ->assertJsonCount(1, 'orders')
            ->assertJsonPath('orders.0.status', 'pending');
    }

    public function test_producer_can_view_order_details()
    {
        $order = Order::factory()->create();
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'producer_id' => $this->producer->id,
        ]);

        Sanctum::actingAs($this->producerUser);

        $response = $this->getJson("/api/v1/producer/orders/{$order->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'order' => ['id', 'status', 'total', 'order_items'],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('order.id', $order->id);
    }

    public function test_producer_can_update_order_status_with_valid_transition()
    {
        $order = Order::factory()->create(['status' => 'pending']);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'producer_id' => $this->producer->id,
        ]);

        Sanctum::actingAs($this->producerUser);

        $response = $this->patchJson("/api/v1/producer/orders/{$order->id}/status", [
            'status' => 'processing',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('order.status', 'processing');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'processing',
        ]);
    }

    public function test_producer_cannot_update_status_with_invalid_transition()
    {
        $order = Order::factory()->create(['status' => 'pending']);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'producer_id' => $this->producer->id,
        ]);

        Sanctum::actingAs($this->producerUser);

        // Try to skip directly to 'delivered' (invalid transition)
        $response = $this->patchJson("/api/v1/producer/orders/{$order->id}/status", [
            'status' => 'delivered',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['valid_transitions']);

        // Order status should remain unchanged
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'pending',
        ]);
    }

    public function test_unauthenticated_user_cannot_access_producer_orders()
    {
        $response = $this->getJson('/api/v1/producer/orders');

        $response->assertUnauthorized();
    }

    public function test_user_without_producer_association_cannot_access_producer_orders()
    {
        $regularUser = User::factory()->create();
        // This user has no producer association

        Sanctum::actingAs($regularUser);

        $response = $this->getJson('/api/v1/producer/orders');

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }
}
