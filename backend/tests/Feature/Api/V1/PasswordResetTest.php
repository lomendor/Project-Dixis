<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Pass EMAIL-AUTH-01: Password Reset Tests
 */
#[\PHPUnit\Framework\Attributes\CoversClass(\App\Http\Controllers\Api\PasswordResetController::class)]
class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test forgot password endpoint always returns 200 (prevents user enumeration)
     */
    public function test_forgot_password_returns_success_for_existing_user(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $response = $this->postJson('/api/v1/auth/password/forgot', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'If an account exists with this email, you will receive a password reset link.',
            ]);
    }

    /**
     * Test forgot password endpoint returns 200 even for non-existent email
     */
    public function test_forgot_password_returns_success_for_nonexistent_user(): void
    {
        $response = $this->postJson('/api/v1/auth/password/forgot', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'If an account exists with this email, you will receive a password reset link.',
            ]);
    }

    /**
     * Test forgot password validates email format
     */
    public function test_forgot_password_validates_email_format(): void
    {
        $response = $this->postJson('/api/v1/auth/password/forgot', [
            'email' => 'invalid-email',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test forgot password requires email field
     */
    public function test_forgot_password_requires_email(): void
    {
        $response = $this->postJson('/api/v1/auth/password/forgot', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test forgot password creates token for existing user
     */
    public function test_forgot_password_creates_token_for_existing_user(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $this->postJson('/api/v1/auth/password/forgot', [
            'email' => 'test@example.com',
        ]);

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    /**
     * Test forgot password does not create token for non-existent user
     */
    public function test_forgot_password_does_not_create_token_for_nonexistent_user(): void
    {
        $this->postJson('/api/v1/auth/password/forgot', [
            'email' => 'nonexistent@example.com',
        ]);

        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'nonexistent@example.com',
        ]);
    }

    /**
     * Test reset password successfully resets password with valid token
     */
    public function test_reset_password_with_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('oldpassword'),
        ]);

        $token = 'valid-reset-token-123';

        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/password/reset', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Password has been reset successfully. Please log in with your new password.',
            ]);

        // Verify password was actually changed
        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));

        // Verify token was deleted
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    /**
     * Test reset password fails with invalid token
     */
    public function test_reset_password_fails_with_invalid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make('correct-token'),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/password/reset', [
            'token' => 'wrong-token',
            'email' => 'test@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Invalid or expired reset token.',
            ]);
    }

    /**
     * Test reset password fails with expired token
     */
    public function test_reset_password_fails_with_expired_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $token = 'expired-token';

        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now()->subMinutes(61), // Token expired (> 60 min)
        ]);

        $response = $this->postJson('/api/v1/auth/password/reset', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Reset token has expired. Please request a new one.',
            ]);

        // Verify expired token was cleaned up
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    /**
     * Test reset password validates password minimum length
     */
    public function test_reset_password_validates_password_length(): void
    {
        $response = $this->postJson('/api/v1/auth/password/reset', [
            'token' => 'some-token',
            'email' => 'test@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test reset password validates password confirmation
     */
    public function test_reset_password_validates_password_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/password/reset', [
            'token' => 'some-token',
            'email' => 'test@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'differentpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test reset password revokes all existing tokens (security: force re-login)
     */
    public function test_reset_password_revokes_existing_tokens(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        // Create some auth tokens for the user
        $user->createToken('device-1');
        $user->createToken('device-2');

        $this->assertCount(2, $user->tokens);

        $token = 'valid-reset-token';

        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $this->postJson('/api/v1/auth/password/reset', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        // Verify all tokens were revoked
        $user->refresh();
        $this->assertCount(0, $user->tokens);
    }

    /**
     * Test forgot password replaces existing token (only one active at a time)
     */
    public function test_forgot_password_replaces_existing_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        // Create first token
        $this->postJson('/api/v1/auth/password/forgot', [
            'email' => 'test@example.com',
        ]);

        $firstTokenRecord = DB::table('password_reset_tokens')
            ->where('email', 'test@example.com')
            ->first();

        // Create second token
        $this->postJson('/api/v1/auth/password/forgot', [
            'email' => 'test@example.com',
        ]);

        // Should only have one token (the new one)
        $count = DB::table('password_reset_tokens')
            ->where('email', 'test@example.com')
            ->count();

        $this->assertEquals(1, $count);
    }
}
