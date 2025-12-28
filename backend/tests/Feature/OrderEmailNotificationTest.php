<?php

namespace Tests\Feature;

use App\Mail\ConsumerOrderPlaced;
use App\Mail\ProducerNewOrder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderNotification;
use App\Models\Producer;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Pass 53: Order Email Notification Tests.
 *
 * Tests:
 * - Feature flag disables sending
 * - Idempotency prevents double-sends
 * - Consumer confirmation email sent
 * - Producer notification email sent (one per producer)
 * - Missing email handled gracefully
 */
class OrderEmailNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    /** @test */
    public function no_emails_sent_when_feature_flag_disabled()
    {
        // Arrange: Disable feature flag
        Config::set('notifications.email_enabled', false);

        $order = $this->createOrderWithItems();
        $service = new OrderEmailService();

        // Act
        $service->sendOrderPlacedNotifications($order);

        // Assert: No emails sent
        Mail::assertNothingSent();
        $this->assertEquals(0, OrderNotification::count());
    }

    /** @test */
    public function consumer_email_sent_when_feature_enabled()
    {
        // Arrange: Enable feature flag
        Config::set('notifications.email_enabled', true);

        $user = User::factory()->create(['email' => 'consumer@test.com']);
        $order = $this->createOrderWithItems(['user_id' => $user->id]);
        $service = new OrderEmailService();

        // Act
        $service->sendOrderPlacedNotifications($order);

        // Assert: Consumer email sent
        Mail::assertSent(ConsumerOrderPlaced::class, function ($mail) use ($order) {
            return $mail->order->id === $order->id;
        });

        // Assert: Notification recorded
        $this->assertDatabaseHas('order_notifications', [
            'order_id' => $order->id,
            'recipient_type' => 'consumer',
            'event' => 'order_placed',
        ]);
    }

    /** @test */
    public function producer_email_sent_when_feature_enabled()
    {
        // Arrange: Enable feature flag
        Config::set('notifications.email_enabled', true);

        $producerUser = User::factory()->create(['email' => 'producer@test.com']);
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);
        $product = Product::factory()->create(['producer_id' => $producer->id]);

        $user = User::factory()->create(['email' => 'consumer@test.com']);
        $order = Order::factory()->create(['user_id' => $user->id]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'producer_id' => $producer->id,
        ]);

        $order->load('orderItems.producer');
        $service = new OrderEmailService();

        // Act
        $service->sendOrderPlacedNotifications($order);

        // Assert: Producer email sent
        Mail::assertSent(ProducerNewOrder::class, function ($mail) use ($order, $producer) {
            return $mail->order->id === $order->id && $mail->producer->id === $producer->id;
        });

        // Assert: Notification recorded
        $this->assertDatabaseHas('order_notifications', [
            'order_id' => $order->id,
            'recipient_type' => 'producer',
            'recipient_id' => $producer->id,
            'event' => 'order_placed',
        ]);
    }

    /** @test */
    public function idempotency_prevents_double_sends()
    {
        // Arrange: Enable feature flag
        Config::set('notifications.email_enabled', true);

        $user = User::factory()->create(['email' => 'consumer@test.com']);
        $order = $this->createOrderWithItems(['user_id' => $user->id]);
        $service = new OrderEmailService();

        // Act: Send notifications twice
        $service->sendOrderPlacedNotifications($order);
        $service->sendOrderPlacedNotifications($order);

        // Assert: Only ONE consumer email sent
        Mail::assertSent(ConsumerOrderPlaced::class, 1);

        // Assert: Only ONE notification record
        $this->assertEquals(1, OrderNotification::where('order_id', $order->id)
            ->where('recipient_type', 'consumer')
            ->count());
    }

    /** @test */
    public function multiple_producers_each_get_their_own_email()
    {
        // Arrange: Enable feature flag
        Config::set('notifications.email_enabled', true);

        // Create two producers with products
        $producerUser1 = User::factory()->create(['email' => 'producer1@test.com']);
        $producer1 = Producer::factory()->create(['user_id' => $producerUser1->id]);
        $product1 = Product::factory()->create(['producer_id' => $producer1->id]);

        $producerUser2 = User::factory()->create(['email' => 'producer2@test.com']);
        $producer2 = Producer::factory()->create(['user_id' => $producerUser2->id]);
        $product2 = Product::factory()->create(['producer_id' => $producer2->id]);

        $user = User::factory()->create(['email' => 'consumer@test.com']);
        $order = Order::factory()->create(['user_id' => $user->id]);

        // Add items from both producers
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product1->id,
            'producer_id' => $producer1->id,
        ]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product2->id,
            'producer_id' => $producer2->id,
        ]);

        $order->load('orderItems.producer');
        $service = new OrderEmailService();

        // Act
        $service->sendOrderPlacedNotifications($order);

        // Assert: Two producer emails sent (one per producer)
        Mail::assertSent(ProducerNewOrder::class, 2);

        // Assert: Two producer notification records
        $this->assertEquals(2, OrderNotification::where('order_id', $order->id)
            ->where('recipient_type', 'producer')
            ->count());
    }

    /** @test */
    public function missing_consumer_email_handled_gracefully()
    {
        // Arrange: Enable feature flag
        Config::set('notifications.email_enabled', true);

        // Order without user (guest order) and no email in shipping_address
        $order = Order::factory()->create([
            'user_id' => null,
            'shipping_address' => ['name' => 'Test', 'line1' => '123 St'],
        ]);

        $service = new OrderEmailService();

        // Act: Should not throw
        $service->sendOrderPlacedNotifications($order);

        // Assert: No consumer email sent (no crash)
        Mail::assertNotSent(ConsumerOrderPlaced::class);
    }

    /** @test */
    public function missing_producer_email_handled_gracefully()
    {
        // Arrange: Enable feature flag
        Config::set('notifications.email_enabled', true);

        // Producer without user AND without email field (no email available)
        $producer = Producer::factory()->create(['user_id' => null, 'email' => null]);
        $product = Product::factory()->create(['producer_id' => $producer->id]);

        $user = User::factory()->create(['email' => 'consumer@test.com']);
        $order = Order::factory()->create(['user_id' => $user->id]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'producer_id' => $producer->id,
        ]);

        $order->load('orderItems.producer');
        $service = new OrderEmailService();

        // Act: Should not throw
        $service->sendOrderPlacedNotifications($order);

        // Assert: Consumer email sent, producer email not sent (no crash)
        Mail::assertSent(ConsumerOrderPlaced::class, 1);
        Mail::assertNotSent(ProducerNewOrder::class);
    }

    /** @test */
    public function producer_email_contains_only_their_items()
    {
        // Arrange: Enable feature flag
        Config::set('notifications.email_enabled', true);

        // Create two producers
        $producerUser1 = User::factory()->create(['email' => 'producer1@test.com']);
        $producer1 = Producer::factory()->create(['user_id' => $producerUser1->id]);
        $product1 = Product::factory()->create(['producer_id' => $producer1->id, 'name' => 'Product A']);

        $producerUser2 = User::factory()->create(['email' => 'producer2@test.com']);
        $producer2 = Producer::factory()->create(['user_id' => $producerUser2->id]);
        $product2 = Product::factory()->create(['producer_id' => $producer2->id, 'name' => 'Product B']);

        $user = User::factory()->create(['email' => 'consumer@test.com']);
        $order = Order::factory()->create(['user_id' => $user->id]);

        // Producer 1 has 2 items, Producer 2 has 1 item
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product1->id,
            'producer_id' => $producer1->id,
            'product_name' => 'Product A',
        ]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product1->id,
            'producer_id' => $producer1->id,
            'product_name' => 'Product A2',
        ]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product2->id,
            'producer_id' => $producer2->id,
            'product_name' => 'Product B',
        ]);

        $order->load('orderItems.producer');
        $service = new OrderEmailService();

        // Act
        $service->sendOrderPlacedNotifications($order);

        // Assert: Each producer email has correct item count
        Mail::assertSent(ProducerNewOrder::class, function ($mail) use ($producer1) {
            if ($mail->producer->id === $producer1->id) {
                return $mail->producerItems->count() === 2;
            }
            return true;
        });

        Mail::assertSent(ProducerNewOrder::class, function ($mail) use ($producer2) {
            if ($mail->producer->id === $producer2->id) {
                return $mail->producerItems->count() === 1;
            }
            return true;
        });
    }

    /**
     * Helper: Create an order with items.
     */
    protected function createOrderWithItems(array $orderAttributes = []): Order
    {
        $order = Order::factory()->create($orderAttributes);

        $producer = Producer::factory()->create();
        $product = Product::factory()->create(['producer_id' => $producer->id]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'producer_id' => $producer->id,
        ]);

        return $order->load('orderItems.producer');
    }
}
