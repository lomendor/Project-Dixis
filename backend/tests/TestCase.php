<?php

namespace Tests;

use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // CI hardening: RefreshDatabase ensures clean test state
        // Prevent stray HTTP requests during tests
        Http::preventStrayRequests();
    }

    /**
     * Authorization headers for admin endpoints behind the jwt.admin
     * middleware (VerifyAdminJwt). Admin auth is a frontend-minted HS256
     * JWT — Sanctum actingAs() never reaches these routes (401).
     *
     * VerifyAdminJwt also requires a User with role=admin to exist in the
     * database; callers must create one (these tests typically already do).
     */
    protected function adminJwtHeaders(): array
    {
        if (! config('app.jwt_secret')) {
            // HS256 requires a key of at least 256 bits (32 bytes)
            config(['app.jwt_secret' => 'dixis-testing-jwt-secret-0123456789abcdef']);
        }

        $token = JWT::encode([
            'iss' => 'dixis-auth',
            'type' => 'admin',
            'iat' => time(),
            'exp' => time() + 3600,
        ], config('app.jwt_secret'), 'HS256');

        return ['Authorization' => "Bearer {$token}"];
    }
}
