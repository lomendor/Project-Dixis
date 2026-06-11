<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pass PAY-INIT-404-01: Payment Init Authorization Tests
 *
 * Tests that payment init endpoint correctly handles:
 * - Guest orders (user_id = null)
 * - Authenticated user's own orders
 * - Authenticated user trying to access another user's order
 */
class PaymentInitAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
    }

    /** @test */
    public function authenticated_user_can_init_payment_for_own_order(): void
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'payment_status' => 'pending',
            'payment_method' => 'CARD',
            'subtotal' => 30.00,
            'total' => 33.50,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/payments/orders/{$order->id}/init");

        // Should not return 404 - may return 400/500 due to Stripe config, but NOT 404
        $this->assertNotEquals(404, $response->status(), 'Owner should be able to access own order');
    }

    /** @test */
    public function authenticated_user_cannot_init_payment_for_other_users_order(): void
    {
        $order = Order::factory()->create([
            'user_id' => $this->otherUser->id,
            'payment_status' => 'pending',
            'payment_method' => 'CARD',
            'subtotal' => 30.00,
            'total' => 33.50,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/payments/orders/{$order->id}/init");

        $response->assertStatus(404);
        $response->assertJson(['message' => 'Order not found']);
    }

    /** @test */
    public function guest_order_payment_requires_matching_token(): void
    {
        // Pass PAY-GUEST-TOKEN-01: guest order (user_id = null) is accessible
        // only with the order's public_token, not by id alone.
        $order = Order::factory()->create([
            'user_id' => null,
            'payment_status' => 'pending',
            'payment_method' => 'CARD',
            'subtotal' => 30.00,
            'total' => 33.50,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/payments/orders/{$order->id}/init", [
                'order_token' => $order->public_token,
            ]);

        // With the correct token, not a 404 (may 400/500 on Stripe config)
        $this->assertNotEquals(404, $response->status(), 'Guest order should be accessible with token');
    }

    /** @test */
    public function guest_order_payment_rejected_without_matching_token(): void
    {
        // The integer order id is sequential and guessable; without the
        // public_token any authenticated user could pay/cancel a stranger's
        // guest order. Must 404.
        $order = Order::factory()->create([
            'user_id' => null,
            'payment_status' => 'pending',
            'payment_method' => 'CARD',
            'subtotal' => 30.00,
            'total' => 33.50,
        ]);

        $this->actingAs($this->user)
            ->postJson("/api/v1/payments/orders/{$order->id}/init")
            ->assertStatus(404);

        $this->actingAs($this->user)
            ->postJson("/api/v1/payments/orders/{$order->id}/init", [
                'order_token' => 'wrong-token',
            ])
            ->assertStatus(404);
    }

    /** @test */
    public function unauthenticated_user_cannot_init_payment(): void
    {
        $order = Order::factory()->create([
            'user_id' => null,
            'payment_status' => 'pending',
            'payment_method' => 'CARD',
        ]);

        $response = $this->postJson("/api/v1/payments/orders/{$order->id}/init");

        $response->assertStatus(401);
        $response->assertJson(['message' => 'Unauthenticated.']);
    }

    /** @test */
    public function cannot_init_payment_for_nonexistent_order(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/payments/orders/99999/init');

        $response->assertStatus(404);
    }

    /** @test */
    public function cannot_init_payment_for_already_paid_order(): void
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'payment_status' => 'paid',
            'payment_method' => 'CARD',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/payments/orders/{$order->id}/init");

        $response->assertStatus(400);
        $response->assertJson(['message' => 'Order has already been paid']);
    }
}
