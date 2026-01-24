<?php

namespace Tests\Feature;

use App\Mail\ConsumerOrderPlaced;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Tests for order email trigger rules.
 *
 * Pass MP-CHECKOUT-PAYMENT-01: Email should be sent:
 * - COD orders: Immediately at order creation
 * - Card orders: Only after payment is confirmed (not at order creation)
 */
class OrderEmailTriggerRulesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        Config::set('notifications.email_enabled', true);
    }

    /**
     * AC1: COD orders should trigger email immediately at order creation.
     */
    public function test_cod_order_triggers_email_at_creation(): void
    {
        $user = User::factory()->consumer()->create(['email' => 'consumer@test.com']);
        $producerUser = User::factory()->create(['email' => 'producer@test.com']);
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 25.00,
            'stock' => 100,
        ]);

        // Create COD order via the public endpoint (same as frontend checkout)
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', [
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 1],
                ],
                'shipping_method' => 'HOME',
                'currency' => 'EUR',
                'payment_method' => 'COD',
            ]);

        $response->assertStatus(201);

        // Verify consumer email was sent
        Mail::assertSent(ConsumerOrderPlaced::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    /**
     * AC2: Card orders should NOT trigger email at order creation.
     * Email should only be sent after payment confirmation.
     */
    public function test_card_order_does_not_trigger_email_at_creation(): void
    {
        $user = User::factory()->consumer()->create(['email' => 'consumer@test.com']);
        $producerUser = User::factory()->create(['email' => 'producer@test.com']);
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 25.00,
            'stock' => 100,
        ]);

        // Create Card order via the public endpoint
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/public/orders', [
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 1],
                ],
                'shipping_method' => 'HOME',
                'currency' => 'EUR',
                'payment_method' => 'CARD',
            ]);

        $response->assertStatus(201);

        // Verify NO email was sent (email comes after payment confirmation)
        Mail::assertNotSent(ConsumerOrderPlaced::class);
    }

    /**
     * AC2 (continued): Card order email is sent after payment confirmation.
     * This simulates what PaymentController does after Stripe confirms payment.
     */
    public function test_card_order_email_sent_after_payment_confirmation(): void
    {
        $user = User::factory()->consumer()->create(['email' => 'consumer@test.com']);
        $producerUser = User::factory()->create(['email' => 'producer@test.com']);
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);
        $product = Product::factory()->create([
            'producer_id' => $producer->id,
            'price' => 25.00,
            'stock' => 100,
        ]);

        // Create Card order (without email trigger)
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'payment_method' => 'CARD',
            'payment_status' => 'pending',
            'status' => 'pending',
            'total' => 28.50,
        ]);

        // Add an order item (required for email service to work)
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'producer_id' => $producer->id,
        ]);

        // Manually call email service (simulating what PaymentController does after confirmation)
        $emailService = app(\App\Services\OrderEmailService::class);
        $emailService->sendOrderPlacedNotifications($order);

        // Verify email was sent
        Mail::assertSent(ConsumerOrderPlaced::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }
}
