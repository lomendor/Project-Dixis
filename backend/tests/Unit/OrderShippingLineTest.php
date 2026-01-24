<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\OrderShippingLine;
use App\Models\Producer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * Pass MP-ORDERS-SHIPPING-V1: Schema smoke tests for order_shipping_lines
 */
class OrderShippingLineTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Verify the order_shipping_lines table exists after migration.
     */
    public function test_order_shipping_lines_table_exists(): void
    {
        $this->assertTrue(
            Schema::hasTable('order_shipping_lines'),
            'Table order_shipping_lines should exist after migration'
        );
    }

    /**
     * Verify the table has all required columns.
     */
    public function test_order_shipping_lines_has_required_columns(): void
    {
        $expectedColumns = [
            'id',
            'order_id',
            'producer_id',
            'producer_name',
            'subtotal',
            'shipping_cost',
            'shipping_method',
            'free_shipping_applied',
            'created_at',
            'updated_at',
        ];

        foreach ($expectedColumns as $column) {
            $this->assertTrue(
                Schema::hasColumn('order_shipping_lines', $column),
                "Column '{$column}' should exist in order_shipping_lines table"
            );
        }
    }

    /**
     * Verify OrderShippingLine model can be created.
     */
    public function test_can_create_order_shipping_line(): void
    {
        // Create required related records
        $user = User::factory()->consumer()->create();
        $producer = Producer::factory()->create(['name' => 'Test Producer']);

        $order = Order::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'subtotal' => 50.00,
            'shipping_cost' => 5.00,
            'total' => 55.00,
            'currency' => 'EUR',
        ]);

        $shippingLine = OrderShippingLine::create([
            'order_id' => $order->id,
            'producer_id' => $producer->id,
            'producer_name' => $producer->name,
            'subtotal' => 50.00,
            'shipping_cost' => 5.00,
            'shipping_method' => 'HOME',
            'free_shipping_applied' => false,
        ]);

        $this->assertDatabaseHas('order_shipping_lines', [
            'id' => $shippingLine->id,
            'order_id' => $order->id,
            'producer_id' => $producer->id,
            'producer_name' => 'Test Producer',
            'subtotal' => 50.00,
            'shipping_cost' => 5.00,
            'free_shipping_applied' => false,
        ]);
    }

    /**
     * Verify Order->shippingLines relationship works.
     */
    public function test_order_has_shipping_lines_relationship(): void
    {
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create(['name' => 'Producer A']);
        $producer2 = Producer::factory()->create(['name' => 'Producer B']);

        $order = Order::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'subtotal' => 80.00,
            'shipping_cost' => 8.00,
            'total' => 88.00,
            'currency' => 'EUR',
        ]);

        // Create two shipping lines for multi-producer order
        OrderShippingLine::create([
            'order_id' => $order->id,
            'producer_id' => $producer1->id,
            'producer_name' => $producer1->name,
            'subtotal' => 50.00,
            'shipping_cost' => 0.00,
            'shipping_method' => 'HOME',
            'free_shipping_applied' => true,
        ]);

        OrderShippingLine::create([
            'order_id' => $order->id,
            'producer_id' => $producer2->id,
            'producer_name' => $producer2->name,
            'subtotal' => 30.00,
            'shipping_cost' => 8.00,
            'shipping_method' => 'HOME',
            'free_shipping_applied' => false,
        ]);

        // Refresh and check relationship
        $order->refresh();
        $this->assertCount(2, $order->shippingLines);
        $this->assertEquals('Producer A', $order->shippingLines->first()->producer_name);
    }
}
