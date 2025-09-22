<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TestLoginController
{
    /**
     * Test-only login endpoint for E2E testing
     * ONLY active when ALLOW_TEST_LOGIN=true and in testing/CI environments
     */
    public function login(Request $request): JsonResponse
    {
        // Security: Only allow in test environments with explicit flag
        if (!$this->isTestLoginAllowed()) {
            abort(404, 'Not Found');
        }

        $request->validate([
            'role' => 'required|in:consumer,producer,admin'
        ]);

        $role = $request->role;
        $email = "{$role}@example.com";

        // Find or create test user
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => ucfirst($role) . ' Test',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Ensure user has the correct role (if using Spatie permissions)
        if (class_exists('Spatie\Permission\Models\Role')) {
            $roleModel = \Spatie\Permission\Models\Role::firstOrCreate(['name' => $role]);
            if (!$user->hasRole($role)) {
                $user->syncRoles([$role]);
            }
        }

        // Create Sanctum token
        $token = $user->createToken('test-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
            ],
            'token' => $token,
            'type' => 'Bearer',
        ]);
    }

    /**
     * Check if test login is allowed
     */
    private function isTestLoginAllowed(): bool
    {
        // Must have explicit flag
        if (!env('ALLOW_TEST_LOGIN', false)) {
            return false;
        }

        // Must be in testing or CI environment
        $appEnv = app()->environment();
        $isCI = env('CI', false);

        return $appEnv === 'testing' || $appEnv === 'local' || $isCI;
    }
}