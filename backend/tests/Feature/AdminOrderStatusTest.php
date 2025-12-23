<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOrderStatusTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $consumer;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->admin = User::factory()->create(['role' => 'admin']);

        // Create consumer user
        $this->consumer = User::factory()->create(['role' => 'consumer']);

        // Create test order
        $this->order = Order::factory()->create([
            'user_id' => $this->consumer->id,
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function admin_can_update_order_status()
    {
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/orders/{$this->order->id}/status", [
                'status' => 'confirmed',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'order' => [
                    'id',
                    'status',
                ],
            ])
            ->assertJsonPath('order.status', 'confirmed');

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'confirmed',
        ]);
    }

    /** @test */
    public function admin_can_update_order_status_with_note()
    {
        $note = 'Customer requested expedited shipping';

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/orders/{$this->order->id}/status", [
                'status' => 'processing',
                'note' => $note,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'processing',
        ]);

        // Note is logged but not stored in orders table (could extend with history table)
    }

    /** @test */
    public function non_admin_cannot_update_order_status()
    {
        $response = $this->actingAs($this->consumer)
            ->patchJson("/api/v1/admin/orders/{$this->order->id}/status", [
                'status' => 'confirmed',
            ]);

        $response->assertStatus(403);

        // Verify status not changed
        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function invalid_status_transition_is_rejected()
    {
        // Cannot jump from pending directly to delivered
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/orders/{$this->order->id}/status", [
                'status' => 'delivered',
            ]);

        $response->assertStatus(422)
            ->assertJsonFragment([
                'error' => 'Invalid status transition from pending to delivered',
            ]);

        // Verify status not changed
        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function invalid_status_value_is_rejected()
    {
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/orders/{$this->order->id}/status", [
                'status' => 'invalid_status',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    /** @test */
    public function unauthenticated_user_cannot_update_order_status()
    {
        $response = $this->patchJson("/api/v1/admin/orders/{$this->order->id}/status", [
            'status' => 'confirmed',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function status_can_transition_through_full_lifecycle()
    {
        // pending → confirmed
        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/orders/{$this->order->id}/status", ['status' => 'confirmed'])
            ->assertStatus(200);

        $this->assertEquals('confirmed', $this->order->fresh()->status);

        // confirmed → processing
        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/orders/{$this->order->id}/status", ['status' => 'processing'])
            ->assertStatus(200);

        $this->assertEquals('processing', $this->order->fresh()->status);

        // processing → shipped
        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/orders/{$this->order->id}/status", ['status' => 'shipped'])
            ->assertStatus(200);

        $this->assertEquals('shipped', $this->order->fresh()->status);

        // shipped → delivered
        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/orders/{$this->order->id}/status", ['status' => 'delivered'])
            ->assertStatus(200);

        $this->assertEquals('delivered', $this->order->fresh()->status);
    }

    /** @test */
    public function status_can_be_cancelled_from_early_states()
    {
        // pending → cancelled
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/orders/{$this->order->id}/status", [
                'status' => 'cancelled',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'cancelled',
        ]);
    }

    /** @test */
    public function delivered_status_is_final()
    {
        // Set order to delivered
        $this->order->update(['status' => 'delivered']);

        // Try to change to any other status
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/orders/{$this->order->id}/status", [
                'status' => 'shipped',
            ]);

        $response->assertStatus(422);

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'delivered',
        ]);
    }
}
