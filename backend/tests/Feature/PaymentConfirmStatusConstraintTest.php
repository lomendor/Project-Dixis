<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pass PROD-STRIPE-CONFIRM-400-FIX-01: Payment Confirm Status Constraint Test
 *
 * Regression test to ensure payment confirmation sets order.status to 'confirmed'
 * (not 'paid') to satisfy the orders_status_check constraint.
 *
 * Root cause: The PostgreSQL check constraint only allows:
 * pending|confirmed|processing|shipped|completed|delivered|cancelled
 *
 * Setting status='paid' violates this constraint and causes HTTP 400.
 */
class PaymentConfirmStatusConstraintTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Force fake payment provider for tests
        config(['services.payment.provider' => 'fake']);

        $this->user = User::factory()->create();
    }

    /** @test */
    public function payment_confirm_sets_status_to_confirmed_not_paid(): void
    {
        // Create order with payment_intent_id (simulating after init)
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'CARD',
            'payment_intent_id' => 'fake_pi_test123',
            'subtotal' => 30.00,
            'total_amount' => 33.50,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/payments/orders/{$order->id}/confirm", [
                'payment_intent_id' => 'fake_pi_test123',
            ]);

        // Should succeed (not 400 from constraint violation)
        $response->assertStatus(200);

        // Refresh order from database
        $order->refresh();

        // CRITICAL: status must be 'confirmed' (allowed by constraint)
        // NOT 'paid' (which violates orders_status_check)
        $this->assertEquals('confirmed', $order->status,
            'Order status must be "confirmed" to satisfy orders_status_check constraint');

        // payment_status should be 'paid' (separate field, no constraint)
        $this->assertEquals('paid', $order->payment_status,
            'Payment status should be "paid" after successful payment');
    }

    /** @test */
    public function payment_confirm_returns_correct_response_structure(): void
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'CARD',
            'payment_intent_id' => 'fake_pi_response_test',
            'subtotal' => 45.00,
            'total_amount' => 50.00,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/payments/orders/{$order->id}/confirm", [
                'payment_intent_id' => 'fake_pi_response_test',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'payment' => [
                    'payment_intent_id',
                    'status',
                ],
                'order' => [
                    'id',
                    'payment_status',
                    'status',
                ],
            ]);

        // Verify response shows correct statuses
        $response->assertJsonPath('order.status', 'confirmed');
        $response->assertJsonPath('order.payment_status', 'paid');
    }

    /** @test */
    public function payment_confirm_fails_for_failed_payment_intent(): void
    {
        // Create order with 'fail' in payment_intent_id to trigger fake provider failure
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'CARD',
            'payment_intent_id' => 'fake_pi_fail_test',
            'subtotal' => 30.00,
            'total_amount' => 33.50,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/payments/orders/{$order->id}/confirm", [
                'payment_intent_id' => 'fake_pi_fail_test',
            ]);

        // Should return 400 for payment failure (not 500 from constraint)
        $response->assertStatus(400);

        // Order status should NOT have changed
        $order->refresh();
        $this->assertEquals('pending', $order->status);
        $this->assertEquals('pending', $order->payment_status);
    }
}
