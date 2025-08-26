<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Producer;
use App\Models\Product;
use App\Models\Message;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Group;

#[Group('mvp')]
class ProducerSystemIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private User $producerUser;
    private Producer $producer;
    private User $consumerUser;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create producer user and producer profile
        $this->producerUser = User::factory()->create([
            'name' => 'Γιάννης Αγρότης',
            'email' => 'giannis@farm.gr'
        ]);
        
        $this->producer = Producer::factory()->create([
            'user_id' => $this->producerUser->id,
            'name' => 'Αγρόκτημα Γιάννη',
            'slug' => 'agrotktima-gianni',
            'business_name' => 'Αγροτικός Συνεταιρισμός Γιάννη ΑΕ',
            'is_active' => true
        ]);
        
        // Create consumer user
        $this->consumerUser = User::factory()->create([
            'name' => 'Μαρία Καταναλώτρια',
            'email' => 'maria@consumer.gr'
        ]);
    }

    #[Group('mvp')]
    public function test_producer_kpi_returns_accurate_metrics(): void
    {
        Sanctum::actingAs($this->producerUser);
        
        // Create products for the producer
        $activeProduct = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Ντομάτες Βιολογικές',
            'is_active' => true,
            'price' => 3.50
        ]);
        
        $inactiveProduct = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Αγγούρια',
            'is_active' => false,
            'price' => 2.20
        ]);
        
        // Create orders with order items
        $order = Order::factory()->create(['status' => 'completed']);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $activeProduct->id,
            'quantity' => 5,
            'unit_price' => 3.50,
            'total_price' => 17.50
        ]);
        
        // Create unread message
        Message::factory()->create([
            'producer_id' => $this->producer->id,
            'is_read' => false
        ]);
        
        $response = $this->getJson('/api/v1/producer/dashboard/kpi');
        
        $response->assertStatus(200)
            ->assertJson([
                'total_products' => 2,
                'active_products' => 1,
                'total_orders' => 1,
                'revenue' => 17.50,
                'unread_messages' => 1
            ]);
    }

    #[Group('mvp')]
    public function test_producer_kpi_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/producer/dashboard/kpi');
        
        $response->assertStatus(401);
    }

    #[Group('mvp')]
    public function test_producer_kpi_requires_producer_profile(): void
    {
        $userWithoutProducer = User::factory()->create();
        Sanctum::actingAs($userWithoutProducer);
        
        $response = $this->getJson('/api/v1/producer/dashboard/kpi');
        
        $response->assertStatus(403)
            ->assertJson(['message' => 'Producer profile not found']);
    }

    #[Group('mvp')]
    public function test_producer_can_toggle_own_product_status(): void
    {
        Sanctum::actingAs($this->producerUser);
        
        $product = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'is_active' => true
        ]);
        
        $response = $this->patchJson("/api/v1/producer/products/{$product->id}/toggle");
        
        $response->assertStatus(200)
            ->assertJson([
                'id' => $product->id,
                'is_active' => false,
                'message' => 'Product status updated successfully'
            ]);
        
        $this->assertFalse($product->fresh()->is_active);
    }

    #[Group('mvp')]
    public function test_producer_cannot_toggle_other_producer_product(): void
    {
        Sanctum::actingAs($this->producerUser);
        
        $otherProducer = Producer::factory()->create();
        $product = Product::factory()->create([
            'producer_id' => $otherProducer->id
        ]);
        
        $response = $this->patchJson("/api/v1/producer/products/{$product->id}/toggle");
        
        $response->assertStatus(404)
            ->assertJson(['message' => 'Product not found']);
    }

    #[Group('mvp')]
    public function test_toggle_product_requires_authentication(): void
    {
        $product = Product::factory()->create(['producer_id' => $this->producer->id]);
        
        $response = $this->patchJson("/api/v1/producer/products/{$product->id}/toggle");
        
        $response->assertStatus(401);
    }

    #[Group('mvp')]
    public function test_toggle_product_requires_producer_profile(): void
    {
        $userWithoutProducer = User::factory()->create();
        Sanctum::actingAs($userWithoutProducer);
        
        $product = Product::factory()->create(['producer_id' => $this->producer->id]);
        
        $response = $this->patchJson("/api/v1/producer/products/{$product->id}/toggle");
        
        $response->assertStatus(403)
            ->assertJson(['message' => 'Producer profile not found']);
    }

    #[Group('mvp')]
    public function test_producer_can_get_top_products(): void
    {
        Sanctum::actingAs($this->producerUser);
        
        $product1 = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Ντομάτες',
            'price' => 3.50
        ]);
        
        $product2 = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'name' => 'Αγγούρια',
            'price' => 2.20
        ]);
        
        // Create orders to make product1 top-selling
        $order = Order::factory()->create(['status' => 'completed']);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product1->id,
            'quantity' => 10,
            'unit_price' => 3.50,
            'total_price' => 35.00
        ]);
        
        $response = $this->getJson('/api/v1/producer/dashboard/top-products?limit=5');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'top_products' => [
                    '*' => [
                        'id',
                        'name',
                        'unit',
                        'current_price',
                        'stock',
                        'is_active',
                        'total_quantity_sold',
                        'total_revenue',
                        'total_orders',
                        'average_unit_price'
                    ]
                ],
                'limit',
                'total_products_shown'
            ])
            ->assertJsonPath('top_products.0.name', 'Ντομάτες')
            ->assertJsonPath('top_products.0.total_quantity_sold', 10);
    }

    #[Group('mvp')]
    public function test_top_products_respects_limit_parameter(): void
    {
        Sanctum::actingAs($this->producerUser);
        
        // Create 3 products
        Product::factory()->count(3)->create(['producer_id' => $this->producer->id]);
        
        $response = $this->getJson('/api/v1/producer/dashboard/top-products?limit=2');
        
        $response->assertStatus(200)
            ->assertJsonPath('limit', 2)
            ->assertJsonCount(2, 'top_products');
    }

    #[Group('mvp')]
    public function test_producer_can_mark_own_message_as_read(): void
    {
        Sanctum::actingAs($this->producerUser);
        
        $message = Message::factory()->create([
            'producer_id' => $this->producer->id,
            'is_read' => false,
            'content' => 'Έχετε νέα παραγγελία!'
        ]);
        
        $response = $this->patchJson("/api/v1/producer/messages/{$message->id}/read");
        
        $response->assertStatus(204);
        $this->assertTrue($message->fresh()->is_read);
    }

    #[Group('mvp')]
    public function test_producer_cannot_mark_other_producer_message_as_read(): void
    {
        Sanctum::actingAs($this->producerUser);
        
        $otherProducer = Producer::factory()->create();
        $message = Message::factory()->create([
            'producer_id' => $otherProducer->id,
            'is_read' => false
        ]);
        
        $response = $this->patchJson("/api/v1/producer/messages/{$message->id}/read");
        
        $response->assertStatus(404)
            ->assertJson(['message' => 'Message not found']);
    }

    #[Group('mvp')]
    public function test_producer_can_reply_to_own_message(): void
    {
        Sanctum::actingAs($this->producerUser);
        
        $parentMessage = Message::factory()->create([
            'producer_id' => $this->producer->id,
            'content' => 'Πότε θα είναι έτοιμη η παραγγελία;'
        ]);
        
        $replyData = [
            'content' => 'Η παραγγελία θα είναι έτοιμη αύριο το πρωί.'
        ];
        
        $response = $this->postJson("/api/v1/producer/messages/{$parentMessage->id}/replies", $replyData);
        
        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'content',
                'user_id',
                'producer_id',
                'parent_id',
                'is_read'
            ])
            ->assertJsonPath('content', $replyData['content'])
            ->assertJsonPath('user_id', $this->producerUser->id)
            ->assertJsonPath('producer_id', $this->producer->id)
            ->assertJsonPath('parent_id', $parentMessage->id)
            ->assertJsonPath('is_read', false);
        
        $this->assertDatabaseHas('messages', [
            'content' => $replyData['content'],
            'user_id' => $this->producerUser->id,
            'producer_id' => $this->producer->id,
            'parent_id' => $parentMessage->id,
            'is_read' => false
        ]);
    }

    #[Group('mvp')]
    public function test_message_reply_validates_content_length(): void
    {
        Sanctum::actingAs($this->producerUser);
        
        $message = Message::factory()->create([
            'producer_id' => $this->producer->id
        ]);
        
        $response = $this->postJson("/api/v1/producer/messages/{$message->id}/replies", [
            'content' => str_repeat('α', 5001) // Over 5000 chars
        ]);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors('content');
    }

    #[Group('mvp')]
    public function test_message_reply_requires_content(): void
    {
        Sanctum::actingAs($this->producerUser);
        
        $message = Message::factory()->create([
            'producer_id' => $this->producer->id
        ]);
        
        $response = $this->postJson("/api/v1/producer/messages/{$message->id}/replies", []);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors('content');
    }

    #[Group('mvp')]
    public function test_producer_cannot_reply_to_other_producer_message(): void
    {
        Sanctum::actingAs($this->producerUser);
        
        $otherProducer = Producer::factory()->create();
        $message = Message::factory()->create([
            'producer_id' => $otherProducer->id
        ]);
        
        $response = $this->postJson("/api/v1/producer/messages/{$message->id}/replies", [
            'content' => 'Αυτό είναι παράνομο!'
        ]);
        
        $response->assertStatus(404)
            ->assertJson(['message' => 'Message not found']);
    }

    #[Group('mvp')]
    public function test_integrated_producer_workflow(): void
    {
        Sanctum::actingAs($this->producerUser);
        
        // 1. Check initial KPIs
        $kpiResponse = $this->getJson('/api/v1/producer/dashboard/kpi');
        $kpiResponse->assertStatus(200)
            ->assertJsonPath('total_products', 0)
            ->assertJsonPath('active_products', 0);
        
        // 2. Create a product (via factory since no create endpoint tested)
        $product = Product::factory()->create([
            'producer_id' => $this->producer->id,
            'is_active' => true
        ]);
        
        // 3. Toggle product status
        $toggleResponse = $this->patchJson("/api/v1/producer/products/{$product->id}/toggle");
        $toggleResponse->assertStatus(200)
            ->assertJsonPath('is_active', false);
        
        // 4. Toggle back to active
        $toggleBackResponse = $this->patchJson("/api/v1/producer/products/{$product->id}/toggle");
        $toggleBackResponse->assertStatus(200)
            ->assertJsonPath('is_active', true);
        
        // 5. Check updated KPIs
        $updatedKpiResponse = $this->getJson('/api/v1/producer/dashboard/kpi');
        $updatedKpiResponse->assertStatus(200)
            ->assertJsonPath('total_products', 1)
            ->assertJsonPath('active_products', 1);
        
        // 6. Create message and reply workflow
        $message = Message::factory()->create([
            'producer_id' => $this->producer->id,
            'is_read' => false
        ]);
        
        // 7. Mark message as read
        $readResponse = $this->patchJson("/api/v1/producer/messages/{$message->id}/read");
        $readResponse->assertStatus(204);
        
        // 8. Reply to message
        $replyResponse = $this->postJson("/api/v1/producer/messages/{$message->id}/replies", [
            'content' => 'Ευχαριστώ για το μήνυμα!'
        ]);
        $replyResponse->assertStatus(201)
            ->assertJsonPath('content', 'Ευχαριστώ για το μήνυμα!');
        
        // 9. Final KPI check should show message as read
        $finalKpiResponse = $this->getJson('/api/v1/producer/dashboard/kpi');
        $finalKpiResponse->assertStatus(200)
            ->assertJsonPath('unread_messages', 1); // The reply creates new unread message
    }

    #[Group('mvp')]
    public function test_producer_system_performance_with_large_dataset(): void
    {
        Sanctum::actingAs($this->producerUser);
        
        // Create 20 products
        Product::factory()->count(20)->create([
            'producer_id' => $this->producer->id
        ]);
        
        // Create multiple orders with items
        for ($i = 0; $i < 10; $i++) {
            $order = Order::factory()->create(['status' => 'completed']);
            OrderItem::factory()->count(3)->create([
                'order_id' => $order->id,
                'product_id' => Product::where('producer_id', $this->producer->id)->inRandomOrder()->first()->id
            ]);
        }
        
        // Test KPI performance
        $startTime = microtime(true);
        $response = $this->getJson('/api/v1/producer/dashboard/kpi');
        $endTime = microtime(true);
        
        $response->assertStatus(200);
        $this->assertLessThan(1.0, $endTime - $startTime, 'KPI endpoint should respond within 1 second');
        
        // Test top products performance  
        $startTime = microtime(true);
        $topProductsResponse = $this->getJson('/api/v1/producer/dashboard/top-products?limit=10');
        $endTime = microtime(true);
        
        $topProductsResponse->assertStatus(200);
        $this->assertLessThan(1.0, $endTime - $startTime, 'Top products endpoint should respond within 1 second');
    }
}
