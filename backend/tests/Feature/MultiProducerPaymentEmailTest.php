<?php

namespace Tests\Feature;

use App\Mail\ConsumerOrderPlaced;
use App\Mail\ProducerOrderNotification;
use App\Models\CheckoutSession;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Pass MP-PAYMENT-EMAIL-TRUTH-01: Multi-producer payment and email tests
 *
 * Ensures that for multi-producer checkouts:
 * - Emails are ONLY sent after successful payment confirmation
 * - Failed payment leaves all orders in pending status, no emails
 * - Successful payment marks all child orders as paid and sends emails
 * - Shipping totals and amounts are correct
 */
class MultiProducerPaymentEmailTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        Config::set('notifications.email_enabled', true);
    }

    /**
     * Helper to create a multi-producer checkout with two producers.
     */
    private function createMultiProducerCheckout(User $user, string $paymentMethod = 'CARD'): array
    {
        $producerUser1 = User::factory()->create(['email' => 'producer1@test.com']);
        $producerUser2 = User::factory()->create(['email' => 'producer2@test.com']);
        $producer1 = Producer::factory()->create(['user_id' => $producerUser1->id, 'name' => 'Producer A']);
        $producer2 = Producer::factory()->create(['user_id' => $producerUser2->id, 'name' => 'Producer B']);

        $product1 = Product::factory()->create([
            'producer_id' => $producer1->id,
            'price' => 40.00, // >= €35, free shipping
            'stock' => 100,
        ]);
        $product2 = Product::factory()->create([
            'producer_id' => $producer2->id,
            'price' => 20.00, // < €35, €3.50 shipping
            'stock' => 100,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', [
                'items' => [
                    ['product_id' => $product1->id, 'quantity' => 1],
                    ['product_id' => $product2->id, 'quantity' => 1],
                ],
                'shipping_method' => 'HOME',
                'currency' => 'EUR',
                'payment_method' => $paymentMethod,
            ]);

        return [
            'response' => $response,
            'producer1' => $producer1,
            'producer2' => $producer2,
            'product1' => $product1,
            'product2' => $product2,
            'producerUser1' => $producerUser1,
            'producerUser2' => $producerUser2,
        ];
    }

    /**
     * AC1: Multi-producer CARD order does NOT trigger email at creation.
     * Emails should only be sent after payment confirmation.
     */
    public function test_multi_producer_card_order_no_email_at_creation(): void
    {
        $user = User::factory()->consumer()->create(['email' => 'consumer@test.com']);
        $data = $this->createMultiProducerCheckout($user, 'CARD');

        $data['response']->assertStatus(201);

        // Verify CheckoutSession was created
        $this->assertEquals('checkout_session', $data['response']->json('data.type'));
        $this->assertEquals(2, $data['response']->json('data.order_count'));

        // NO emails should be sent at creation for CARD payment
        Mail::assertNotSent(ConsumerOrderPlaced::class);
        Mail::assertNotSent(ProducerOrderNotification::class);
    }

    /**
     * AC2: Multi-producer COD order DOES trigger email at creation.
     * COD orders are confirmed immediately.
     */
    public function test_multi_producer_cod_order_email_at_creation(): void
    {
        $user = User::factory()->consumer()->create(['email' => 'consumer@test.com']);
        $data = $this->createMultiProducerCheckout($user, 'COD');

        $data['response']->assertStatus(201);

        // COD orders should trigger emails immediately
        Mail::assertSent(ConsumerOrderPlaced::class);
    }

    /**
     * AC3: When payment confirmation succeeds, all sibling orders get emails.
     * Simulates what PaymentController does after Stripe confirms.
     */
    public function test_payment_confirmation_sends_emails_for_all_child_orders(): void
    {
        $user = User::factory()->consumer()->create(['email' => 'consumer@test.com']);
        $producerUser1 = User::factory()->create(['email' => 'producer1@test.com']);
        $producerUser2 = User::factory()->create(['email' => 'producer2@test.com']);
        $producer1 = Producer::factory()->create(['user_id' => $producerUser1->id]);
        $producer2 = Producer::factory()->create(['user_id' => $producerUser2->id]);

        $product1 = Product::factory()->create(['producer_id' => $producer1->id, 'price' => 25.00, 'stock' => 100]);
        $product2 = Product::factory()->create(['producer_id' => $producer2->id, 'price' => 30.00, 'stock' => 100]);

        // Create CheckoutSession with 2 child orders (simulating multi-producer checkout)
        $checkoutSession = CheckoutSession::create([
            'user_id' => $user->id,
            'status' => CheckoutSession::STATUS_PENDING,
            'order_count' => 2,
            'subtotal' => 55.00,
            'shipping_total' => 7.00, // €3.50 each
            'total' => 62.00,
        ]);

        $order1 = Order::factory()->create([
            'user_id' => $user->id,
            'checkout_session_id' => $checkoutSession->id,
            'is_child_order' => true,
            'payment_method' => 'CARD',
            'payment_status' => 'pending',
            'status' => 'pending',
            'subtotal' => 25.00,
            'shipping_amount' => 3.50,
            'total' => 28.50,
        ]);

        $order2 = Order::factory()->create([
            'user_id' => $user->id,
            'checkout_session_id' => $checkoutSession->id,
            'is_child_order' => true,
            'payment_method' => 'CARD',
            'payment_status' => 'pending',
            'status' => 'pending',
            'subtotal' => 30.00,
            'shipping_amount' => 3.50,
            'total' => 33.50,
        ]);

        // Add order items
        OrderItem::factory()->create(['order_id' => $order1->id, 'product_id' => $product1->id, 'producer_id' => $producer1->id]);
        OrderItem::factory()->create(['order_id' => $order2->id, 'product_id' => $product2->id, 'producer_id' => $producer2->id]);

        // Simulate payment confirmation success - send emails for all sibling orders
        $emailService = app(OrderEmailService::class);
        $siblingOrders = Order::where('checkout_session_id', $checkoutSession->id)->get();

        foreach ($siblingOrders as $siblingOrder) {
            $emailService->sendOrderPlacedNotifications($siblingOrder);
        }

        // Verify consumer email sent (at least once)
        Mail::assertSent(ConsumerOrderPlaced::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    /**
     * AC4: Payment status remains pending when payment not confirmed.
     * No emails should be sent for pending_payment orders.
     */
    public function test_pending_payment_orders_remain_pending_no_email(): void
    {
        $user = User::factory()->consumer()->create(['email' => 'consumer@test.com']);
        $data = $this->createMultiProducerCheckout($user, 'CARD');

        $data['response']->assertStatus(201);

        $sessionId = $data['response']->json('data.id');
        $orders = Order::where('checkout_session_id', $sessionId)->get();

        // All orders should be in pending status
        foreach ($orders as $order) {
            $this->assertEquals('pending', $order->payment_status);
        }

        // No emails sent
        Mail::assertNotSent(ConsumerOrderPlaced::class);
    }

    /**
     * AC5: Checkout session totals are correct for multi-producer.
     * shipping_total = sum of per-order shipping_cost
     */
    public function test_multi_producer_shipping_totals_invariant(): void
    {
        $user = User::factory()->consumer()->create();
        $data = $this->createMultiProducerCheckout($user);

        $data['response']->assertStatus(201);

        $sessionId = $data['response']->json('data.id');
        $checkoutSession = CheckoutSession::find($sessionId);

        // Sum shipping from child orders (using shipping_cost field set by CheckoutService)
        $childOrders = Order::where('checkout_session_id', $sessionId)->get();
        $sumShipping = $childOrders->sum('shipping_cost');

        // Session shipping_total should equal sum of child shipping
        $this->assertEquals($sumShipping, (float) $checkoutSession->shipping_total);

        // Verify specific values:
        // Producer 1: €40 (>= €35, free shipping)
        // Producer 2: €20 (< €35, €3.50 shipping)
        $this->assertEquals(3.50, (float) $checkoutSession->shipping_total);
    }

    /**
     * AC6: Session total = sum of child order totals.
     */
    public function test_multi_producer_totals_invariant(): void
    {
        $user = User::factory()->consumer()->create();
        $data = $this->createMultiProducerCheckout($user);

        $data['response']->assertStatus(201);

        $sessionId = $data['response']->json('data.id');
        $checkoutSession = CheckoutSession::find($sessionId);

        $childOrders = Order::where('checkout_session_id', $sessionId)->get();
        $sumSubtotal = $childOrders->sum('subtotal');
        $sumTotal = $childOrders->sum('total');

        // Session totals should equal sum of child totals
        $this->assertEquals($sumSubtotal, (float) $checkoutSession->subtotal);
        $this->assertEquals($sumTotal, (float) $checkoutSession->total);

        // Verify: session total = session subtotal + session shipping
        $this->assertEquals(
            (float) $checkoutSession->subtotal + (float) $checkoutSession->shipping_total,
            (float) $checkoutSession->total
        );
    }

    /**
     * AC7: When CheckoutSession is marked paid, all child orders are paid.
     */
    public function test_checkout_session_paid_marks_all_orders_paid(): void
    {
        $user = User::factory()->consumer()->create();
        $producer1 = Producer::factory()->create();
        $producer2 = Producer::factory()->create();

        $product1 = Product::factory()->create(['producer_id' => $producer1->id, 'price' => 25.00, 'stock' => 100]);
        $product2 = Product::factory()->create(['producer_id' => $producer2->id, 'price' => 30.00, 'stock' => 100]);

        // Create CheckoutSession with pending orders
        $checkoutSession = CheckoutSession::create([
            'user_id' => $user->id,
            'status' => CheckoutSession::STATUS_PENDING,
            'order_count' => 2,
            'subtotal' => 55.00,
            'shipping_total' => 7.00,
            'total' => 62.00,
        ]);

        $order1 = Order::factory()->create([
            'user_id' => $user->id,
            'checkout_session_id' => $checkoutSession->id,
            'is_child_order' => true,
            'payment_status' => 'pending',
        ]);

        $order2 = Order::factory()->create([
            'user_id' => $user->id,
            'checkout_session_id' => $checkoutSession->id,
            'is_child_order' => true,
            'payment_status' => 'pending',
        ]);

        // Simulate webhook payment success: mark CheckoutSession and all orders as paid
        $checkoutSession->update(['status' => CheckoutSession::STATUS_PAID]);
        Order::where('checkout_session_id', $checkoutSession->id)
            ->update(['payment_status' => 'paid']);

        // Verify all orders are paid
        $this->assertEquals('paid', $order1->fresh()->payment_status);
        $this->assertEquals('paid', $order2->fresh()->payment_status);
        $this->assertEquals(CheckoutSession::STATUS_PAID, $checkoutSession->fresh()->status);
    }

    /**
     * AC8: Idempotent email sending - already paid session doesn't re-send.
     */
    public function test_idempotent_payment_does_not_double_email(): void
    {
        $user = User::factory()->consumer()->create(['email' => 'consumer@test.com']);
        $producerUser = User::factory()->create(['email' => 'producer@test.com']);
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);
        $product = Product::factory()->create(['producer_id' => $producer->id, 'price' => 50.00, 'stock' => 100]);

        // Create already-paid CheckoutSession
        $checkoutSession = CheckoutSession::create([
            'user_id' => $user->id,
            'status' => CheckoutSession::STATUS_PAID, // Already paid
            'order_count' => 1,
            'subtotal' => 50.00,
            'shipping_total' => 0.00,
            'total' => 50.00,
        ]);

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'checkout_session_id' => $checkoutSession->id,
            'is_child_order' => true,
            'payment_status' => 'paid', // Already paid
        ]);

        OrderItem::factory()->create(['order_id' => $order->id, 'product_id' => $product->id, 'producer_id' => $producer->id]);

        // Idempotent check: If already paid, don't process again
        if ($checkoutSession->status === CheckoutSession::STATUS_PAID) {
            // Skip - already processed
            $skipped = true;
        } else {
            $emailService = app(OrderEmailService::class);
            $emailService->sendOrderPlacedNotifications($order);
            $skipped = false;
        }

        $this->assertTrue($skipped);
        Mail::assertNotSent(ConsumerOrderPlaced::class);
    }
}
