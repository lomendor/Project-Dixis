<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Producer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProductModerationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $producer;
    private User $consumer;
    private Product $pendingProduct;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->admin = User::factory()->create(['role' => 'admin']);

        // Create producer user with producer record
        $this->producer = User::factory()->create(['role' => 'producer']);
        $producerRecord = Producer::factory()->create(['user_id' => $this->producer->id]);

        // Create consumer user
        $this->consumer = User::factory()->create(['role' => 'consumer']);

        // Create pending product
        $this->pendingProduct = Product::factory()->create([
            'producer_id' => $producerRecord->id,
            'approval_status' => 'pending',
        ]);
    }

    /** @test */
    public function admin_can_list_pending_products()
    {
        // Create approved product (should NOT appear in pending list)
        Product::factory()->create([
            'producer_id' => $this->pendingProduct->producer_id,
            'approval_status' => 'approved',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/products/pending');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'approval_status', 'producer'],
                ],
            ])
            ->assertJsonFragment([
                'id' => $this->pendingProduct->id,
                'approval_status' => 'pending',
            ]);

        // Verify only pending products are returned
        $this->assertEquals(1, count($response->json('data')));
    }

    /** @test */
    public function non_admin_cannot_list_pending_products()
    {
        $response = $this->actingAs($this->producer)
            ->getJson('/api/v1/admin/products/pending');

        $response->assertStatus(403);

        $response = $this->actingAs($this->consumer)
            ->getJson('/api/v1/admin/products/pending');

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_approve_product()
    {
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/products/{$this->pendingProduct->id}/moderate", [
                'action' => 'approve',
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Product approved successfully',
            ])
            ->assertJsonPath('product.approval_status', 'approved')
            ->assertJsonPath('product.moderated_by', $this->admin->id)
            ->assertJsonPath('product.rejection_reason', null);

        // Verify database
        $this->assertDatabaseHas('products', [
            'id' => $this->pendingProduct->id,
            'approval_status' => 'approved',
            'moderated_by' => $this->admin->id,
            'rejection_reason' => null,
        ]);

        $this->pendingProduct->refresh();
        $this->assertNotNull($this->pendingProduct->moderated_at);
    }

    /** @test */
    public function admin_can_reject_product_with_reason()
    {
        $reason = 'Product images do not meet quality standards. Please upload higher resolution photos.';

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/products/{$this->pendingProduct->id}/moderate", [
                'action' => 'reject',
                'reason' => $reason,
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Product rejected successfully',
            ])
            ->assertJsonPath('product.approval_status', 'rejected')
            ->assertJsonPath('product.moderated_by', $this->admin->id)
            ->assertJsonPath('product.rejection_reason', $reason);

        // Verify database
        $this->assertDatabaseHas('products', [
            'id' => $this->pendingProduct->id,
            'approval_status' => 'rejected',
            'moderated_by' => $this->admin->id,
            'rejection_reason' => $reason,
        ]);

        $this->pendingProduct->refresh();
        $this->assertNotNull($this->pendingProduct->moderated_at);
    }

    /** @test */
    public function reject_action_requires_reason()
    {
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/products/{$this->pendingProduct->id}/moderate", [
                'action' => 'reject',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['reason']);
    }

    /** @test */
    public function reject_reason_must_be_at_least_10_characters()
    {
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/products/{$this->pendingProduct->id}/moderate", [
                'action' => 'reject',
                'reason' => 'Too short',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['reason']);
    }

    /** @test */
    public function non_admin_cannot_moderate_products()
    {
        // Producer attempt
        $response = $this->actingAs($this->producer)
            ->patchJson("/api/v1/admin/products/{$this->pendingProduct->id}/moderate", [
                'action' => 'approve',
            ]);

        $response->assertStatus(403);

        // Consumer attempt
        $response = $this->actingAs($this->consumer)
            ->patchJson("/api/v1/admin/products/{$this->pendingProduct->id}/moderate", [
                'action' => 'approve',
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function moderation_action_must_be_valid()
    {
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/products/{$this->pendingProduct->id}/moderate", [
                'action' => 'invalid_action',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['action']);
    }

    /** @test */
    public function moderation_requires_authentication()
    {
        $response = $this->getJson('/api/v1/admin/products/pending');
        $response->assertStatus(401);

        $response = $this->patchJson("/api/v1/admin/products/{$this->pendingProduct->id}/moderate", [
            'action' => 'approve',
        ]);
        $response->assertStatus(401);
    }
}
