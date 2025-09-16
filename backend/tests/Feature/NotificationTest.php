<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private NotificationService $notificationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->notificationService = app(NotificationService::class);
    }

    public function test_can_create_in_app_notification()
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'payment_status' => 'paid',
            'total_amount' => 45.50,
        ]);

        $this->notificationService->sendOrderPlacedNotification($order);

        $notification = Notification::where('user_id', $user->id)->first();

        $this->assertNotNull($notification);
        $this->assertEquals('order_placed', $notification->type);
        $this->assertEquals($order->id, $notification->payload['order_id']);
        $this->assertEquals(45.50, $notification->payload['total_amount']);
        $this->assertNull($notification->read_at);
    }

    public function test_can_get_unread_notifications_count()
    {
        $user = User::factory()->create();

        // Create some notifications
        Notification::factory()->count(3)->create(['user_id' => $user->id, 'read_at' => null]);
        Notification::factory()->count(2)->create(['user_id' => $user->id, 'read_at' => now()]);

        $count = $this->notificationService->getUnreadCount($user);

        $this->assertEquals(3, $count);
    }

    public function test_can_mark_notification_as_read()
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->create(['user_id' => $user->id, 'read_at' => null]);

        $this->assertTrue($notification->isUnread());

        $this->notificationService->markAsRead($notification);
        $notification->refresh();

        $this->assertFalse($notification->isUnread());
        $this->assertNotNull($notification->read_at);
    }

    public function test_notifications_api_endpoint()
    {
        $user = User::factory()->create();
        Notification::factory()->count(5)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/notifications/');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'notifications' => [
                    '*' => [
                        'id',
                        'user_id',
                        'type',
                        'payload',
                        'read_at',
                        'created_at',
                        'updated_at',
                    ]
                ],
                'pagination' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ]
            ]);

        $this->assertCount(5, $response->json()['notifications']);
    }

    public function test_unread_count_api_endpoint()
    {
        $user = User::factory()->create();
        Notification::factory()->count(3)->create(['user_id' => $user->id, 'read_at' => null]);
        Notification::factory()->count(2)->create(['user_id' => $user->id, 'read_at' => now()]);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/notifications/unread-count');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'unread_count' => 3,
            ]);
    }

    public function test_mark_notification_as_read_api_endpoint()
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->create(['user_id' => $user->id, 'read_at' => null]);

        $response = $this->actingAs($user)
            ->patchJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Η ειδοποίηση επισημάνθηκε ως αναγνωσμένη',
            ]);

        $notification->refresh();
        $this->assertNotNull($notification->read_at);
    }

    public function test_mark_all_as_read_api_endpoint()
    {
        $user = User::factory()->create();
        Notification::factory()->count(3)->create(['user_id' => $user->id, 'read_at' => null]);

        $response = $this->actingAs($user)
            ->patchJson('/api/v1/notifications/read-all');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Όλες οι ειδοποιήσεις επισημάνθηκαν ως αναγνωσμένες',
            ]);

        $unreadCount = Notification::where('user_id', $user->id)->whereNull('read_at')->count();
        $this->assertEquals(0, $unreadCount);
    }

    public function test_cannot_access_other_users_notifications()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $notification = Notification::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user1)
            ->patchJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthorized access to notification',
            ]);
    }

    public function test_refund_notification_is_sent()
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'payment_status' => 'paid',
            'total_amount' => 45.50,
        ]);

        $this->notificationService->sendRefundIssuedNotification($order, 20.00);

        $notification = Notification::where('user_id', $user->id)
            ->where('type', 'refund_issued')
            ->first();

        $this->assertNotNull($notification);
        $this->assertEquals('refund_issued', $notification->type);
        $this->assertEquals($order->id, $notification->payload['order_id']);
        $this->assertEquals(20.00, $notification->payload['refund_amount']);
    }
}