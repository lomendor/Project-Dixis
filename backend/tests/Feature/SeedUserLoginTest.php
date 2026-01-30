<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

/**
 * Tests for seed user login blocking (data hygiene).
 * Ensures is_seed=true users cannot login when DIXIS_BLOCK_SEED_LOGINS=true.
 */
#[Group('auth')]
#[Group('seed')]
class SeedUserLoginTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a seed user (is_seed=true) cannot login when feature flag is enabled.
     */
    public function test_seed_user_cannot_login_when_flag_enabled(): void
    {
        // Enable the feature flag
        config(['dixis.block_seed_logins' => true]);

        // Create user marked as seed
        $user = User::factory()->create([
            'email' => 'seed@example.com',
            'password' => Hash::make('password123'),
            'is_seed' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'seed@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Account disabled',
            ]);

        // Ensure no token was created
        $this->assertCount(0, $user->fresh()->tokens);
    }

    /**
     * Test that a seed user CAN login when feature flag is disabled (default).
     */
    public function test_seed_user_can_login_when_flag_disabled(): void
    {
        // Ensure the feature flag is disabled (default)
        config(['dixis.block_seed_logins' => false]);

        // Create user marked as seed
        $user = User::factory()->create([
            'email' => 'seed@example.com',
            'password' => Hash::make('password123'),
            'is_seed' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'seed@example.com',
            'password' => 'password123',
        ]);

        // Should allow login when flag is disabled
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Login successful',
            ])
            ->assertJsonStructure(['token']);

        // Ensure token was created
        $this->assertCount(1, $user->fresh()->tokens);
    }

    /**
     * Test that a normal user (is_seed=false) can still login regardless of flag.
     */
    public function test_normal_user_can_login(): void
    {
        // Enable the flag to prove it doesn't affect normal users
        config(['dixis.block_seed_logins' => true]);

        // Create normal user (is_seed defaults to false)
        $user = User::factory()->create([
            'email' => 'real@customer.gr',
            'password' => Hash::make('password123'),
            'is_seed' => false,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'real@customer.gr',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Login successful',
            ])
            ->assertJsonStructure(['token']);

        // Ensure token was created
        $this->assertCount(1, $user->fresh()->tokens);
    }

    /**
     * Test that is_seed column exists and defaults to false.
     */
    public function test_is_seed_defaults_to_false(): void
    {
        $user = User::factory()->create([
            'email' => 'new@user.gr',
            'password' => Hash::make('password123'),
        ]);

        $this->assertFalse($user->is_seed);
        $this->assertDatabaseHas('users', [
            'email' => 'new@user.gr',
            'is_seed' => false,
        ]);
    }

    /**
     * Test that seed user gets 403, not 401 (important for frontend handling).
     */
    public function test_seed_user_gets_403_not_401_when_blocked(): void
    {
        // Enable the feature flag
        config(['dixis.block_seed_logins' => true]);

        User::factory()->create([
            'email' => 'demo@example.com',
            'password' => Hash::make('demo123'),
            'is_seed' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'demo@example.com',
            'password' => 'demo123',
        ]);

        // Must be 403 (forbidden), not 401 (unauthorized)
        // This distinguishes "blocked account" from "wrong password"
        $response->assertStatus(403);
    }

    /**
     * Test that feature flag defaults to false (gradual rollout).
     */
    public function test_feature_flag_defaults_to_false(): void
    {
        // Don't set the config - use the default
        $this->assertFalse(config('dixis.block_seed_logins'));
    }
}
