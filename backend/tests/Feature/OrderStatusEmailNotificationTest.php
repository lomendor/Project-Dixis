<?php

namespace Tests\Feature;

use App\Mail\OrderDelivered;
use App\Mail\OrderShipped;
use App\Models\Order;
use App\Models\OrderNotification;
use App\Models\User;
use App\Services\OrderEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Pass 54: Order Status Email Notification Tests.
 *
 * Tests:
 * - Feature flag disables sending
 * - Shipped status sends email once
 * - Delivered status sends email once
 * - Idempotency prevents double-sends
 */
class OrderStatusEmailNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    /** @test */
    public function no_email_sent_when_feature_flag_disabled()
    {
        Config::set('notifications.email_enabled', false);

        $user = User::factory()->create(['email' => 'consumer@test.com']);
        $order = Order::factory()->create(['user_id' => $user->id, 'status' => 'processing']);

        $service = new OrderEmailService();
        $service->sendOrderStatusNotification($order, 'shipped');

        Mail::assertNothingSent();
        $this->assertEquals(0, OrderNotification::count());
    }

    /** @test */
    public function shipped_status_sends_email()
    {
        Config::set('notifications.email_enabled', true);

        $user = User::factory()->create(['email' => 'consumer@test.com']);
        $order = Order::factory()->create(['user_id' => $user->id, 'status' => 'shipped']);

        $service = new OrderEmailService();
        $service->sendOrderStatusNotification($order, 'shipped');

        Mail::assertSent(OrderShipped::class, function ($mail) use ($order) {
            return $mail->order->id === $order->id;
        });

        $this->assertDatabaseHas('order_notifications', [
            'order_id' => $order->id,
            'recipient_type' => 'consumer',
            'event' => 'order_shipped',
        ]);
    }

    /** @test */
    public function delivered_status_sends_email()
    {
        Config::set('notifications.email_enabled', true);

        $user = User::factory()->create(['email' => 'consumer@test.com']);
        $order = Order::factory()->create(['user_id' => $user->id, 'status' => 'delivered']);

        $service = new OrderEmailService();
        $service->sendOrderStatusNotification($order, 'delivered');

        Mail::assertSent(OrderDelivered::class, function ($mail) use ($order) {
            return $mail->order->id === $order->id;
        });

        $this->assertDatabaseHas('order_notifications', [
            'order_id' => $order->id,
            'recipient_type' => 'consumer',
            'event' => 'order_delivered',
        ]);
    }

    /** @test */
    public function idempotency_prevents_double_send_for_shipped()
    {
        Config::set('notifications.email_enabled', true);

        $user = User::factory()->create(['email' => 'consumer@test.com']);
        $order = Order::factory()->create(['user_id' => $user->id, 'status' => 'shipped']);

        $service = new OrderEmailService();
        $service->sendOrderStatusNotification($order, 'shipped');
        $service->sendOrderStatusNotification($order, 'shipped');

        // Only ONE email sent
        Mail::assertSent(OrderShipped::class, 1);

        // Only ONE notification record
        $this->assertEquals(1, OrderNotification::where('order_id', $order->id)
            ->where('event', 'order_shipped')
            ->count());
    }

    /** @test */
    public function idempotency_prevents_double_send_for_delivered()
    {
        Config::set('notifications.email_enabled', true);

        $user = User::factory()->create(['email' => 'consumer@test.com']);
        $order = Order::factory()->create(['user_id' => $user->id, 'status' => 'delivered']);

        $service = new OrderEmailService();
        $service->sendOrderStatusNotification($order, 'delivered');
        $service->sendOrderStatusNotification($order, 'delivered');

        // Only ONE email sent
        Mail::assertSent(OrderDelivered::class, 1);

        // Only ONE notification record
        $this->assertEquals(1, OrderNotification::where('order_id', $order->id)
            ->where('event', 'order_delivered')
            ->count());
    }

    /** @test */
    public function other_statuses_do_not_send_email()
    {
        Config::set('notifications.email_enabled', true);

        $user = User::factory()->create(['email' => 'consumer@test.com']);
        $order = Order::factory()->create(['user_id' => $user->id, 'status' => 'processing']);

        $service = new OrderEmailService();

        // These statuses should NOT trigger email
        $service->sendOrderStatusNotification($order, 'confirmed');
        $service->sendOrderStatusNotification($order, 'processing');
        $service->sendOrderStatusNotification($order, 'cancelled');

        Mail::assertNothingSent();
        $this->assertEquals(0, OrderNotification::count());
    }

    /** @test */
    public function missing_email_handled_gracefully()
    {
        Config::set('notifications.email_enabled', true);

        // Order without user (guest order) and no email in shipping_address
        $order = Order::factory()->create([
            'user_id' => null,
            'shipping_address' => ['name' => 'Test', 'line1' => '123 St'],
            'status' => 'shipped',
        ]);

        $service = new OrderEmailService();

        // Should not throw
        $service->sendOrderStatusNotification($order, 'shipped');

        // No email sent (no crash)
        Mail::assertNothingSent();
    }

    /** @test */
    public function shipped_and_delivered_are_separate_events()
    {
        Config::set('notifications.email_enabled', true);

        $user = User::factory()->create(['email' => 'consumer@test.com']);
        $order = Order::factory()->create(['user_id' => $user->id, 'status' => 'shipped']);

        $service = new OrderEmailService();

        // Send shipped notification
        $service->sendOrderStatusNotification($order, 'shipped');

        // Update order status and send delivered notification
        $order->update(['status' => 'delivered']);
        $service->sendOrderStatusNotification($order, 'delivered');

        // Both emails should be sent (separate events)
        Mail::assertSent(OrderShipped::class, 1);
        Mail::assertSent(OrderDelivered::class, 1);

        // Two notification records
        $this->assertEquals(2, OrderNotification::where('order_id', $order->id)->count());
    }
}
