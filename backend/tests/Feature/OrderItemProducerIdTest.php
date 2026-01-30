<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Producer;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Guardrail tests to ensure order_items.producer_id is always set.
 *
 * Prevents regression where NULL producer_id causes scoping issues
 * in producer dashboards (order items invisible to their producer).
 */
class OrderItemProducerIdTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_item_factory_sets_producer_id_from_product(): void
    {
        // Arrange: create a producer and product
        $producer = Producer::factory()->create();
        $product = Product::factory()->create(['producer_id' => $producer->id]);

        // Act: create order item using factory with forProduct
        $orderItem = OrderItem::factory()->forProduct($product)->create();

        // Assert: producer_id is set and matches product's producer
        $this->assertNotNull($orderItem->producer_id, 'OrderItem.producer_id should not be NULL');
        $this->assertEquals($producer->id, $orderItem->producer_id, 'OrderItem.producer_id should match product producer');
    }

    public function test_order_item_created_with_product_must_have_producer_id(): void
    {
        // Arrange
        $producer = Producer::factory()->create();
        $product = Product::factory()->create(['producer_id' => $producer->id]);
        $order = Order::factory()->create();

        // Act: manually create order item with explicit producer_id
        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'producer_id' => $product->producer_id,
            'quantity' => 2,
            'unit_price' => $product->price,
            'total_price' => $product->price * 2,
            'product_name' => $product->name,
            'product_unit' => $product->unit ?? 'piece',
        ]);

        // Assert
        $this->assertNotNull($orderItem->producer_id);
        $this->assertEquals($producer->id, $orderItem->producer_id);
    }

    public function test_existing_order_items_have_producer_id_set(): void
    {
        // Arrange: create some products and order items
        $producer1 = Producer::factory()->create();
        $producer2 = Producer::factory()->create();

        $product1 = Product::factory()->create(['producer_id' => $producer1->id]);
        $product2 = Product::factory()->create(['producer_id' => $producer2->id]);

        $order = Order::factory()->create();

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product1->id,
            'producer_id' => $product1->producer_id,
            'quantity' => 1,
            'unit_price' => 10.00,
            'total_price' => 10.00,
            'product_name' => $product1->name,
            'product_unit' => 'piece',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product2->id,
            'producer_id' => $product2->producer_id,
            'quantity' => 1,
            'unit_price' => 15.00,
            'total_price' => 15.00,
            'product_name' => $product2->name,
            'product_unit' => 'piece',
        ]);

        // Act: query all order items
        $orderItems = OrderItem::all();

        // Assert: NO order items should have NULL producer_id
        $nullProducerItems = $orderItems->whereNull('producer_id');
        $this->assertCount(
            0,
            $nullProducerItems,
            'No order items should have NULL producer_id. Found: '.$nullProducerItems->count()
        );

        // Assert: each item's producer_id matches its product's producer
        foreach ($orderItems as $item) {
            $product = Product::find($item->product_id);
            $this->assertEquals(
                $product->producer_id,
                $item->producer_id,
                "OrderItem #{$item->id} producer_id should match product #{$product->id} producer_id"
            );
        }
    }
}
