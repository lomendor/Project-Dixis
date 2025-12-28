<?php

namespace Tests\Feature;

use App\Mail\ProducerWeeklyDigest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Producer;
use App\Models\ProducerDigest;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Pass 55: Producer Weekly Digest Tests.
 *
 * Tests:
 * - Feature flag disables command
 * - Idempotency prevents double-sends
 * - Correct aggregates calculated
 * - Missing email handled gracefully
 */
class ProducerWeeklyDigestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    /** @test */
    public function command_sends_nothing_when_feature_flag_disabled()
    {
        Config::set('notifications.producer_digest_enabled', false);

        $producerUser = User::factory()->create(['email' => 'producer@test.com']);
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);

        $this->artisan('producers:digest-weekly')
            ->assertSuccessful();

        Mail::assertNothingSent();
        $this->assertEquals(0, ProducerDigest::count());
    }

    /** @test */
    public function command_sends_digest_when_feature_enabled()
    {
        Config::set('notifications.producer_digest_enabled', true);

        $producerUser = User::factory()->create(['email' => 'producer@test.com']);
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);

        // Create an order with items for this producer within the last 7 days
        $product = Product::factory()->create(['producer_id' => $producer->id, 'price' => 10.00]);
        $order = Order::factory()->create([
            'created_at' => Carbon::yesterday(),
            'status' => 'pending',
        ]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'producer_id' => $producer->id,
            'quantity' => 3,
            'unit_price' => 10.00,
            'total_price' => 30.00,
            'product_name' => 'Test Product',
        ]);

        $this->artisan('producers:digest-weekly')
            ->assertSuccessful();

        Mail::assertSent(ProducerWeeklyDigest::class, function ($mail) use ($producer) {
            return $mail->producer->id === $producer->id;
        });

        $this->assertEquals(1, ProducerDigest::count());
    }

    /** @test */
    public function idempotency_prevents_double_send()
    {
        Config::set('notifications.producer_digest_enabled', true);

        $producerUser = User::factory()->create(['email' => 'producer@test.com']);
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);

        // Run command twice
        $this->artisan('producers:digest-weekly')->assertSuccessful();
        $this->artisan('producers:digest-weekly')->assertSuccessful();

        // Only ONE email sent
        Mail::assertSent(ProducerWeeklyDigest::class, 1);
        $this->assertEquals(1, ProducerDigest::count());
    }

    /** @test */
    public function command_calculates_correct_aggregates()
    {
        Config::set('notifications.producer_digest_enabled', true);

        $producerUser = User::factory()->create(['email' => 'producer@test.com']);
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);

        // Create product
        $product = Product::factory()->create(['producer_id' => $producer->id]);

        // Order 1: pending, yesterday
        $order1 = Order::factory()->create([
            'created_at' => Carbon::yesterday(),
            'status' => 'pending',
        ]);
        OrderItem::factory()->create([
            'order_id' => $order1->id,
            'product_id' => $product->id,
            'producer_id' => $producer->id,
            'quantity' => 2,
            'total_price' => 20.00,
            'product_name' => 'Product A',
        ]);

        // Order 2: delivered, 3 days ago
        $order2 = Order::factory()->create([
            'created_at' => Carbon::now()->subDays(3),
            'status' => 'delivered',
        ]);
        OrderItem::factory()->create([
            'order_id' => $order2->id,
            'product_id' => $product->id,
            'producer_id' => $producer->id,
            'quantity' => 5,
            'total_price' => 50.00,
            'product_name' => 'Product A',
        ]);

        $this->artisan('producers:digest-weekly')->assertSuccessful();

        // Verify digest was sent with correct stats
        Mail::assertSent(ProducerWeeklyDigest::class, function ($mail) {
            // 2 orders, €70 revenue, 1 pending, 1 delivered
            return $mail->stats['orders_count'] === 2
                && $mail->stats['gross_revenue'] === 70.0
                && $mail->stats['pending_count'] === 1
                && $mail->stats['delivered_count'] === 1;
        });
    }

    /** @test */
    public function missing_email_handled_gracefully()
    {
        Config::set('notifications.producer_digest_enabled', true);

        // Producer without user and without email
        $producer = Producer::factory()->create(['user_id' => null, 'email' => null]);

        $this->artisan('producers:digest-weekly')
            ->assertSuccessful();

        // No email sent, no crash
        Mail::assertNothingSent();
        $this->assertEquals(0, ProducerDigest::count());
    }

    /** @test */
    public function dry_run_outputs_counts_without_sending()
    {
        Config::set('notifications.producer_digest_enabled', true);

        $producerUser = User::factory()->create(['email' => 'producer@test.com']);
        $producer = Producer::factory()->create([
            'user_id' => $producerUser->id,
            'business_name' => 'Test Farm',
        ]);

        $this->artisan('producers:digest-weekly', ['--dry-run' => true])
            ->assertSuccessful()
            ->expectsOutputToContain('DRY-RUN');

        // No email sent in dry-run
        Mail::assertNothingSent();
        // No digest record created in dry-run
        $this->assertEquals(0, ProducerDigest::count());
    }

    /** @test */
    public function orders_outside_period_are_excluded()
    {
        Config::set('notifications.producer_digest_enabled', true);

        $producerUser = User::factory()->create(['email' => 'producer@test.com']);
        $producer = Producer::factory()->create(['user_id' => $producerUser->id]);
        $product = Product::factory()->create(['producer_id' => $producer->id]);

        // Order from 10 days ago (outside 7-day rolling window)
        $oldOrder = Order::factory()->create([
            'created_at' => Carbon::now()->subDays(10),
            'status' => 'delivered',
        ]);
        OrderItem::factory()->create([
            'order_id' => $oldOrder->id,
            'product_id' => $product->id,
            'producer_id' => $producer->id,
            'quantity' => 100,
            'total_price' => 1000.00,
        ]);

        $this->artisan('producers:digest-weekly')->assertSuccessful();

        // Digest sent but with 0 orders (old order excluded)
        Mail::assertSent(ProducerWeeklyDigest::class, function ($mail) {
            return $mail->stats['orders_count'] === 0
                && $mail->stats['gross_revenue'] === 0.0;
        });
    }
}
