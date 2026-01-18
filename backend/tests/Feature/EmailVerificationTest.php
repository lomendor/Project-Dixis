<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Pass EMAIL-VERIFY-01: Email verification feature tests.
 */
class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Ensure email_verification_tokens table exists
        if (!$this->app['db']->getSchemaBuilder()->hasTable('email_verification_tokens')) {
            $this->artisan('migrate', ['--path' => 'database/migrations/2026_01_18_000001_create_email_verification_tokens_table.php']);
        }
    }

    /** @test */
    public function verify_endpoint_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/auth/email/verify', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['token', 'email']);
    }

    /** @test */
    public function verify_returns_error_for_invalid_token(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        // Create a valid token record
        $realToken = 'valid-token-123';
        DB::table('email_verification_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($realToken),
            'created_at' => now(),
        ]);

        // Try with wrong token
        $response = $this->postJson('/api/v1/auth/email/verify', [
            'token' => 'wrong-token',
            'email' => $user->email,
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Invalid or expired verification token.']);
    }

    /** @test */
    public function verify_returns_error_for_expired_token(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $realToken = 'valid-token-123';
        DB::table('email_verification_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($realToken),
            'created_at' => now()->subHours(25), // Expired (>24h)
        ]);

        $response = $this->postJson('/api/v1/auth/email/verify', [
            'token' => $realToken,
            'email' => $user->email,
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Verification token has expired. Please request a new one.']);

        // Token should be deleted
        $this->assertDatabaseMissing('email_verification_tokens', ['email' => $user->email]);
    }

    /** @test */
    public function verify_succeeds_with_valid_token(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $realToken = 'valid-token-123';
        DB::table('email_verification_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($realToken),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/email/verify', [
            'token' => $realToken,
            'email' => $user->email,
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Email verified successfully. You can now log in.']);

        // User should be verified
        $this->assertNotNull($user->fresh()->email_verified_at);

        // Token should be deleted (single-use)
        $this->assertDatabaseMissing('email_verification_tokens', ['email' => $user->email]);
    }

    /** @test */
    public function verify_returns_success_for_already_verified_user(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $realToken = 'valid-token-123';
        DB::table('email_verification_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($realToken),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/email/verify', [
            'token' => $realToken,
            'email' => $user->email,
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Email is already verified.']);
    }

    /** @test */
    public function verify_returns_error_for_nonexistent_email(): void
    {
        $response = $this->postJson('/api/v1/auth/email/verify', [
            'token' => 'any-token',
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Invalid or expired verification token.']);
    }

    /** @test */
    public function resend_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/auth/email/resend', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function resend_always_returns_success_to_prevent_enumeration(): void
    {
        // Non-existent email
        $response = $this->postJson('/api/v1/auth/email/resend', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'If an account exists with this email and is not yet verified, you will receive a verification link.']);
    }

    /** @test */
    public function resend_creates_token_for_unverified_user(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $response = $this->postJson('/api/v1/auth/email/resend', [
            'email' => $user->email,
        ]);

        $response->assertStatus(200);

        // Token should be created
        $this->assertDatabaseHas('email_verification_tokens', ['email' => $user->email]);
    }

    /** @test */
    public function resend_does_not_create_token_for_verified_user(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $response = $this->postJson('/api/v1/auth/email/resend', [
            'email' => $user->email,
        ]);

        $response->assertStatus(200);

        // Token should NOT be created
        $this->assertDatabaseMissing('email_verification_tokens', ['email' => $user->email]);
    }

    /** @test */
    public function resend_replaces_existing_token(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        // Create initial token
        DB::table('email_verification_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make('old-token'),
            'created_at' => now()->subHours(1),
        ]);

        $this->postJson('/api/v1/auth/email/resend', [
            'email' => $user->email,
        ]);

        // Should have exactly one token (old one replaced)
        $this->assertEquals(1, DB::table('email_verification_tokens')->where('email', $user->email)->count());
    }
}
