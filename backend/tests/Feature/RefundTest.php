<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use App\Services\Payment\PaymentProviderFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RefundTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_refund_with_fake_provider()
    {
        // Create test user and order
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'payment_status' => 'paid',
            'payment_intent_id' => 'fake_pi_test123',
            'total_amount' => 45.50,
        ]);

        // Test refund creation
        $provider = PaymentProviderFactory::create('fake');
        $result = $provider->refund($order, 2000, 'customer_request'); // €20.00

        $this->assertTrue($result['success']);
        $this->assertEquals(2000, $result['amount_cents']);
        $this->assertEquals(20.00, $result['amount_euros']);
        $this->assertEquals('succeeded', $result['status']);

        // Verify order was updated
        $order->refresh();
        $this->assertNotNull($order->refund_id);
        $this->assertEquals(2000, $order->refunded_amount_cents);
        $this->assertNotNull($order->refunded_at);
    }

    public function test_cannot_refund_order_without_payment_intent()
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'payment_status' => 'pending',
            'total_amount' => 45.50,
        ]);

        $provider = PaymentProviderFactory::create('fake');
        $result = $provider->refund($order);

        $this->assertFalse($result['success']);
        $this->assertEquals('no_payment_intent', $result['error']);
    }

    public function test_cannot_refund_unpaid_order()
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'payment_status' => 'pending',
            'payment_intent_id' => 'fake_pi_test123',
            'total_amount' => 45.50,
        ]);

        $provider = PaymentProviderFactory::create('fake');
        $result = $provider->refund($order);

        $this->assertFalse($result['success']);
        $this->assertEquals('order_not_paid', $result['error']);
    }

    public function test_cannot_refund_more_than_paid_amount()
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'payment_status' => 'paid',
            'payment_intent_id' => 'fake_pi_test123',
            'total_amount' => 45.50, // €45.50 = 4550 cents
        ]);

        $provider = PaymentProviderFactory::create('fake');
        $result = $provider->refund($order, 5000); // Try to refund €50.00

        $this->assertFalse($result['success']);
        $this->assertEquals('amount_exceeds_refundable', $result['error']);
        $this->assertEquals(4550, $result['max_refundable_cents']);
    }

    public function test_refund_api_endpoint()
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'payment_status' => 'paid',
            'payment_intent_id' => 'fake_pi_test123',
            'total_amount' => 45.50,
        ]);

        $response = $this->actingAs($user)
            ->postJson("/api/v1/refunds/orders/{$order->id}", [
                'amount_cents' => 2000,
                'reason' => 'customer_request',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Επιστροφή χρημάτων ξεκίνησε επιτυχώς',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'refund' => [
                    'success',
                    'refund_id',
                    'amount_cents',
                    'amount_euros',
                    'currency',
                    'status',
                    'reason',
                    'created_at',
                ],
            ]);
    }

    public function test_get_refund_info_endpoint()
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'payment_status' => 'paid',
            'payment_intent_id' => 'fake_pi_test123',
            'total_amount' => 45.50,
            'refund_id' => 'fake_re_test123',
            'refunded_amount_cents' => 2000,
            'refunded_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/v1/refunds/orders/{$order->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'refund_info' => [
                    'order_id',
                    'refund_id',
                    'refunded_amount_cents',
                    'refunded_amount_euros',
                    'refunded_at',
                    'is_refunded',
                    'total_amount_cents',
                    'max_refundable_cents',
                ],
            ]);

        $refundInfo = $response->json()['refund_info'];
        $this->assertEquals($order->id, $refundInfo['order_id']);
        $this->assertEquals('fake_re_test123', $refundInfo['refund_id']);
        $this->assertEquals(2000, $refundInfo['refunded_amount_cents']);
        $this->assertEquals(20.00, $refundInfo['refunded_amount_euros']);
        $this->assertTrue($refundInfo['is_refunded']);
        $this->assertEquals(4550, $refundInfo['total_amount_cents']);
        $this->assertEquals(2550, $refundInfo['max_refundable_cents']); // 45.50 - 20.00 = 25.50
    }
}
