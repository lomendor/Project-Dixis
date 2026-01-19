<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

/**
 * Pass SEC-AUTH-RL-02: Auth endpoint rate limiting tests.
 *
 * Tests verify that login and register endpoints return HTTP 429
 * after exceeding their rate limits.
 */
#[Group('auth')]
#[Group('rate-limit')]
class AuthRateLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Clear rate limiters before each test
        RateLimiter::clear('auth-login');
        RateLimiter::clear('auth-register');
    }

    /**
     * Test login rate limiting: 11 attempts should trigger 429.
     * Limit is 10 per minute per IP+email combination.
     */
    public function test_login_rate_limit_triggers_429_after_10_attempts(): void
    {
        // Create a user for consistent testing
        User::factory()->create([
            'email' => 'ratelimit@example.com',
            'password' => Hash::make('password123'),
        ]);

        $loginData = [
            'email' => 'ratelimit@example.com',
            'password' => 'wrongpassword',
        ];

        // First 10 attempts should return 401 (invalid credentials)
        for ($i = 1; $i <= 10; $i++) {
            $response = $this->postJson('/api/v1/auth/login', $loginData);
            $this->assertEquals(
                401,
                $response->status(),
                "Attempt {$i}: Expected 401, got {$response->status()}"
            );
        }

        // 11th attempt should trigger rate limit (429)
        $response = $this->postJson('/api/v1/auth/login', $loginData);
        $response->assertStatus(429);
    }

    /**
     * Test register rate limiting: 6 attempts should trigger 429.
     * Limit is 5 per minute per IP.
     */
    public function test_register_rate_limit_triggers_429_after_5_attempts(): void
    {
        // First 5 attempts should return 422 (duplicate email after first)
        // or 201 (success) for first attempt
        for ($i = 1; $i <= 5; $i++) {
            $response = $this->postJson('/api/v1/auth/register', [
                'name' => "Test User {$i}",
                'email' => "ratelimit-{$i}@example.com",
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role' => 'consumer',
            ]);
            $this->assertContains(
                $response->status(),
                [201, 422],
                "Attempt {$i}: Expected 201 or 422, got {$response->status()}"
            );
        }

        // 6th attempt should trigger rate limit (429)
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User 6',
            'email' => 'ratelimit-6@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'consumer',
        ]);
        $response->assertStatus(429);
    }

    /**
     * Test that login rate limit is keyed by email+IP combination.
     * Different emails should have independent limits.
     */
    public function test_login_rate_limit_is_per_email(): void
    {
        // Create two users
        User::factory()->create([
            'email' => 'user1@example.com',
            'password' => Hash::make('password123'),
        ]);
        User::factory()->create([
            'email' => 'user2@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Exhaust rate limit for user1
        for ($i = 1; $i <= 10; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'user1@example.com',
                'password' => 'wrong',
            ]);
        }

        // user1 should now be rate limited
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'user1@example.com',
            'password' => 'wrong',
        ]);
        $response->assertStatus(429);

        // user2 should NOT be rate limited (different key)
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'user2@example.com',
            'password' => 'wrong',
        ]);
        $this->assertNotEquals(
            429,
            $response->status(),
            'Different email should have independent rate limit'
        );
    }

    /**
     * Test rate limit response includes Retry-After header.
     */
    public function test_rate_limit_response_includes_retry_after_header(): void
    {
        // Exhaust login rate limit
        for ($i = 1; $i <= 11; $i++) {
            $response = $this->postJson('/api/v1/auth/login', [
                'email' => 'retry@example.com',
                'password' => 'wrong',
            ]);
        }

        // Should be rate limited with Retry-After header
        $response->assertStatus(429);
        $response->assertHeader('Retry-After');
    }
}
