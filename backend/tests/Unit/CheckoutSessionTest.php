<?php

namespace Tests\Unit;

use App\Models\CheckoutSession;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pass MP-ORDERS-SCHEMA-01: CheckoutSession Unit Tests
 *
 * Tests for the CheckoutSession model and its relationships.
 */
class CheckoutSessionTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function checkout_sessions_table_exists(): void
    {
        $this->assertTrue(
            \Schema::hasTable('checkout_sessions'),
            'checkout_sessions table should exist'
        );
    }

    /** @test */
    public function checkout_sessions_has_required_columns(): void
    {
        $columns = \Schema::getColumnListing('checkout_sessions');

        $this->assertContains('id', $columns);
        $this->assertContains('user_id', $columns);
        $this->assertContains('stripe_payment_intent_id', $columns);
        $this->assertContains('subtotal', $columns);
        $this->assertContains('shipping_total', $columns);
        $this->assertContains('total', $columns);
        $this->assertContains('status', $columns);
        $this->assertContains('currency', $columns);
        $this->assertContains('order_count', $columns);
        $this->assertContains('created_at', $columns);
        $this->assertContains('updated_at', $columns);
    }

    /** @test */
    public function orders_table_has_checkout_session_columns(): void
    {
        $columns = \Schema::getColumnListing('orders');

        $this->assertContains('checkout_session_id', $columns);
        $this->assertContains('is_child_order', $columns);
    }

    /** @test */
    public function can_create_checkout_session(): void
    {
        $session = CheckoutSession::create([
            'subtotal' => 50.00,
            'shipping_total' => 7.00,
            'total' => 57.00,
            'status' => CheckoutSession::STATUS_PENDING,
            'currency' => 'EUR',
            'order_count' => 2,
        ]);

        $this->assertDatabaseHas('checkout_sessions', [
            'id' => $session->id,
            'subtotal' => 50.00,
            'shipping_total' => 7.00,
            'total' => 57.00,
            'status' => 'pending',
            'order_count' => 2,
        ]);
    }

    /** @test */
    public function checkout_session_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $session = CheckoutSession::create([
            'user_id' => $user->id,
            'subtotal' => 50.00,
            'shipping_total' => 0,
            'total' => 50.00,
        ]);

        $this->assertInstanceOf(User::class, $session->user);
        $this->assertEquals($user->id, $session->user->id);
    }

    /** @test */
    public function checkout_session_has_many_orders(): void
    {
        $user = User::factory()->create();
        $session = CheckoutSession::create([
            'user_id' => $user->id,
            'subtotal' => 50.00,
            'shipping_total' => 7.00,
            'total' => 57.00,
            'order_count' => 2,
        ]);

        // Create 2 child orders
        $order1 = Order::create([
            'user_id' => $user->id,
            'checkout_session_id' => $session->id,
            'is_child_order' => true,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'card',
            'subtotal' => 30.00,
            'shipping_cost' => 3.50,
            'total' => 33.50,
        ]);

        $order2 = Order::create([
            'user_id' => $user->id,
            'checkout_session_id' => $session->id,
            'is_child_order' => true,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'card',
            'subtotal' => 20.00,
            'shipping_cost' => 3.50,
            'total' => 23.50,
        ]);

        $this->assertCount(2, $session->orders);
        $this->assertTrue($session->orders->contains($order1));
        $this->assertTrue($session->orders->contains($order2));
    }

    /** @test */
    public function order_belongs_to_checkout_session(): void
    {
        $user = User::factory()->create();
        $session = CheckoutSession::create([
            'user_id' => $user->id,
            'subtotal' => 30.00,
            'shipping_total' => 3.50,
            'total' => 33.50,
            'order_count' => 1,
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'checkout_session_id' => $session->id,
            'is_child_order' => true,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'card',
            'subtotal' => 30.00,
            'shipping_cost' => 3.50,
            'total' => 33.50,
        ]);

        $this->assertInstanceOf(CheckoutSession::class, $order->checkoutSession);
        $this->assertEquals($session->id, $order->checkoutSession->id);
        $this->assertTrue($order->isChildOrder());
    }

    /** @test */
    public function is_multi_producer_returns_correct_value(): void
    {
        $singleProducerSession = CheckoutSession::create([
            'subtotal' => 30.00,
            'shipping_total' => 0,
            'total' => 30.00,
            'order_count' => 1,
        ]);

        $multiProducerSession = CheckoutSession::create([
            'subtotal' => 50.00,
            'shipping_total' => 7.00,
            'total' => 57.00,
            'order_count' => 2,
        ]);

        $this->assertFalse($singleProducerSession->isMultiProducer());
        $this->assertTrue($multiProducerSession->isMultiProducer());
    }

    /** @test */
    public function mark_as_paid_updates_session_and_orders(): void
    {
        $user = User::factory()->create();
        $session = CheckoutSession::create([
            'user_id' => $user->id,
            'subtotal' => 50.00,
            'shipping_total' => 7.00,
            'total' => 57.00,
            'status' => CheckoutSession::STATUS_PAYMENT_PROCESSING,
            'order_count' => 2,
        ]);

        $order1 = Order::create([
            'user_id' => $user->id,
            'checkout_session_id' => $session->id,
            'is_child_order' => true,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'card',
            'subtotal' => 30.00,
            'shipping_cost' => 3.50,
            'total' => 33.50,
        ]);

        $order2 = Order::create([
            'user_id' => $user->id,
            'checkout_session_id' => $session->id,
            'is_child_order' => true,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'card',
            'subtotal' => 20.00,
            'shipping_cost' => 3.50,
            'total' => 23.50,
        ]);

        $session->markAsPaid();

        $session->refresh();
        $order1->refresh();
        $order2->refresh();

        $this->assertEquals(CheckoutSession::STATUS_PAID, $session->status);
        $this->assertTrue($session->isPaid());
        $this->assertEquals('paid', $order1->payment_status);
        $this->assertEquals('paid', $order2->payment_status);
    }

    /** @test */
    public function recalculate_totals_sums_child_orders(): void
    {
        $user = User::factory()->create();
        $session = CheckoutSession::create([
            'user_id' => $user->id,
            'subtotal' => 0,
            'shipping_total' => 0,
            'total' => 0,
            'order_count' => 0,
        ]);

        Order::create([
            'user_id' => $user->id,
            'checkout_session_id' => $session->id,
            'is_child_order' => true,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'card',
            'subtotal' => 40.00,
            'shipping_cost' => 0.00, // Free shipping (>= €35)
            'total' => 40.00,
        ]);

        Order::create([
            'user_id' => $user->id,
            'checkout_session_id' => $session->id,
            'is_child_order' => true,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'card',
            'subtotal' => 18.00,
            'shipping_cost' => 3.50,
            'total' => 21.50,
        ]);

        $session->recalculateTotals();
        $session->refresh();

        $this->assertEquals('58.00', $session->subtotal);
        $this->assertEquals('3.50', $session->shipping_total);
        $this->assertEquals('61.50', $session->total);
        $this->assertEquals(2, $session->order_count);
    }

    /** @test */
    public function standalone_order_has_null_checkout_session(): void
    {
        $user = User::factory()->create();

        $order = Order::create([
            'user_id' => $user->id,
            'checkout_session_id' => null,
            'is_child_order' => false,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'card',
            'subtotal' => 30.00,
            'shipping_cost' => 3.50,
            'total' => 33.50,
        ]);

        $this->assertNull($order->checkoutSession);
        $this->assertFalse($order->isChildOrder());
    }
}
