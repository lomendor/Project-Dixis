<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;
use App\Models\User;
use App\Models\Producer;
use App\Models\Message;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

#[Group('mvp')]
class MessageEndpointsTest extends TestCase 
{
    use RefreshDatabase;
    
    protected function setUp(): void 
    { 
        parent::setUp(); 
    }
    
    private function createProducerWithMessage()
    {
        // Create producer user
        $user = User::factory()->create([
            'email' => 'message-producer@test.com',
            'role' => 'producer'
        ]);
        
        // Create producer profile
        $producer = Producer::factory()->create([
            'user_id' => $user->id
        ]);
        
        // Create a message for this producer
        $message = Message::factory()->create([
            'user_id' => $user->id,
            'producer_id' => $producer->id,
            'is_read' => false
        ]);
        
        return [$user, $producer, $message];
    }
    
    #[Group('mvp')]
    public function test_mark_as_read()
    {
        [$user, $producer, $message] = $this->createProducerWithMessage();
        
        $token = $user->createToken('test')->plainTextToken;
        
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->patchJson("/api/v1/producer/messages/{$message->id}/read");
                         
        $response->assertOk()
                ->assertJson([
                    'id' => $message->id,
                    'is_read' => true
                ]);
    }
    
    #[Group('mvp')]
    public function test_store_reply()
    {
        [$user, $producer, $message] = $this->createProducerWithMessage();
        
        $token = $user->createToken('test')->plainTextToken;
        
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson("/api/v1/producer/messages/{$message->id}/replies", [
                             'body' => 'Thanks!'
                         ]);
                         
        $response->assertCreated()
                ->assertJson([
                    'parent_id' => $message->id,
                    'body' => 'Thanks!'
                ]);
                
        // Verify reply was created in database
        $this->assertDatabaseHas('messages', [
            'parent_id' => $message->id,
            'body' => 'Thanks!'
        ]);
    }
}