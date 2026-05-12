<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * ADMIN-PRODUCER-DELETE-01: Feature coverage for the two-mode delete flow.
 *
 * Mode selection is driven by activity, not admin choice:
 *   hard ⇐ no order_items + no order_shipping_lines + no commission_settlements
 *   soft ⇐ any of the above > 0  (anonymize, keep row for traceability)
 *
 * User row safety: even on hard mode, the linked User is anonymized rather
 * than deleted if the user also has customer orders — otherwise the cascade
 * on orders.user_id would wipe a customer's history.
 */
class AdminProducerDestroyTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $consumer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->consumer = User::factory()->create(['role' => 'consumer']);
    }

    /** @test */
    public function non_admin_cannot_delete_producer(): void
    {
        $producer = $this->makeProducer();

        $this->actingAs($this->consumer)
            ->deleteJson("/api/v1/admin/producers/{$producer->id}")
            ->assertStatus(403);
    }

    /** @test */
    public function delete_returns_404_for_unknown_producer(): void
    {
        $this->actingAs($this->admin)
            ->deleteJson('/api/v1/admin/producers/999999')
            ->assertStatus(404);
    }

    /** @test */
    public function preview_reports_hard_mode_for_pre_revenue_producer(): void
    {
        $producer = $this->makeProducer();

        $this->actingAs($this->admin)
            ->getJson("/api/v1/admin/producers/{$producer->id}/deletion-preview")
            ->assertStatus(200)
            ->assertJsonPath('mode', 'hard')
            ->assertJsonPath('references.order_items', 0)
            ->assertJsonPath('user_will_be_deleted', true);
    }

    /** @test */
    public function pre_revenue_producer_is_hard_deleted_with_user_row(): void
    {
        $producer = $this->makeProducer();
        $producerUserId = $producer->user_id;

        // Producer has a product — verifies cascade
        Product::factory()->create(['producer_id' => $producer->id]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/v1/admin/producers/{$producer->id}", ['reason' => 'founder request'])
            ->assertStatus(200)
            ->assertJsonPath('mode', 'hard')
            ->assertJsonPath('user_anonymized', false);

        $this->assertDatabaseMissing('producers', ['id' => $producer->id]);
        $this->assertDatabaseMissing('users', ['id' => $producerUserId]);
        // products cascade
        $this->assertDatabaseMissing('products', ['producer_id' => $producer->id]);
    }

    /** @test */
    public function producer_with_customer_orders_on_same_user_is_hard_deleted_but_user_is_anonymized(): void
    {
        // Edge case: a single User row is both a producer AND has placed
        // customer orders. Cascading on orders.user_id would wipe the orders,
        // so the User must be anonymized instead of deleted.
        $producer = $this->makeProducer();
        $userId = $producer->user_id;

        // Customer order placed by the same user
        Order::factory()->create(['user_id' => $userId]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/v1/admin/producers/{$producer->id}")
            ->assertStatus(200)
            ->assertJsonPath('mode', 'hard')
            ->assertJsonPath('user_anonymized', true);

        $this->assertDatabaseMissing('producers', ['id' => $producer->id]);
        $this->assertDatabaseHas('users', ['id' => $userId]);
        $this->assertDatabaseHas('orders', ['user_id' => $userId]);

        $user = User::find($userId);
        $this->assertNotNull($user->anonymized_at);
        $this->assertSame('Διαγραφημένος Χρήστης', $user->name);
        $this->assertStringStartsWith('deleted-', $user->email);
    }

    /** @test */
    public function producer_with_order_items_is_soft_deleted_and_anonymized(): void
    {
        $producer = $this->makeProducer();
        $product = Product::factory()->create(['producer_id' => $producer->id]);
        $order = Order::factory()->create(['user_id' => $this->consumer->id]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'producer_id' => $producer->id,
        ]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/v1/admin/producers/{$producer->id}", ['reason' => 'GDPR DSR'])
            ->assertStatus(200)
            ->assertJsonPath('mode', 'soft')
            ->assertJsonPath('user_anonymized', true)
            ->assertJsonPath('references.order_items', 1);

        $fresh = Producer::find($producer->id);
        $this->assertNotNull($fresh);
        $this->assertNotNull($fresh->anonymized_at);
        $this->assertFalse((bool) $fresh->is_active);
        $this->assertNull($fresh->email);
        $this->assertNull($fresh->phone);
        $this->assertNull($fresh->iban);
        $this->assertNull($fresh->tax_id);
        $this->assertSame('Διαγραφημένος Παραγωγός', $fresh->name);
        $this->assertSame('GDPR DSR', $fresh->deletion_reason);

        // Order item still points to producer for traceability
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'producer_id' => $producer->id,
        ]);
    }

    /** @test */
    public function delete_is_idempotent_after_anonymization(): void
    {
        $producer = $this->makeProducer();
        $producer->update(['anonymized_at' => now()]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/v1/admin/producers/{$producer->id}")
            ->assertStatus(409);

        $this->actingAs($this->admin)
            ->getJson("/api/v1/admin/producers/{$producer->id}/deletion-preview")
            ->assertStatus(409);
    }

    private function makeProducer(): Producer
    {
        $user = User::factory()->create(['role' => 'producer']);
        return Producer::factory()->create(['user_id' => $user->id]);
    }
}
