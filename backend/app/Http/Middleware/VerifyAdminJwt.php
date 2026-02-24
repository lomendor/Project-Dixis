<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

/**
 * Verify admin JWT tokens from the Next.js frontend proxy.
 *
 * The Next.js admin panel authenticates via phone OTP → HS256 JWT
 * stored in a `dixis_session` HttpOnly cookie. Admin proxy routes
 * forward this JWT as a Bearer token to Laravel.
 *
 * This middleware:
 * 1. Extracts the Bearer token
 * 2. Verifies it as an HS256 JWT (same JWT_SECRET as frontend)
 * 3. Checks type=admin and issuer=dixis-auth
 * 4. Sets Auth::user() to an admin User for downstream middleware
 */
class VerifyAdminJwt
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json([
                'error' => 'unauthenticated',
                'message' => 'No token provided.',
            ], 401);
        }

        $secret = config('app.jwt_secret');

        if (! $secret) {
            report(new \RuntimeException('JWT_SECRET not configured in Laravel .env'));

            return response()->json([
                'error' => 'server_error',
                'message' => 'Server authentication not configured.',
            ], 500);
        }

        try {
            $payload = JWT::decode($token, new Key($secret, 'HS256'));
        } catch (ExpiredException $e) {
            return response()->json([
                'error' => 'unauthenticated',
                'message' => 'Token expired.',
            ], 401);
        } catch (SignatureInvalidException $e) {
            return response()->json([
                'error' => 'unauthenticated',
                'message' => 'Invalid token signature.',
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'unauthenticated',
                'message' => 'Invalid token.',
            ], 401);
        }

        // Verify this is an admin token
        if (! isset($payload->type) || $payload->type !== 'admin') {
            return response()->json([
                'error' => 'forbidden',
                'message' => 'Not an admin token.',
            ], 403);
        }

        // Verify issuer matches our auth system
        if (! isset($payload->iss) || $payload->iss !== 'dixis-auth') {
            return response()->json([
                'error' => 'unauthenticated',
                'message' => 'Invalid token issuer.',
            ], 401);
        }

        // The JWT is cryptographically valid and issued by our frontend.
        // The frontend already verified the admin against the AdminUser table.
        // We just need a User model with role=admin for Laravel's middleware chain.
        $adminUser = User::where('role', 'admin')->first();

        if (! $adminUser) {
            return response()->json([
                'error' => 'forbidden',
                'message' => 'No admin user configured in database.',
            ], 403);
        }

        Auth::setUser($adminUser);

        return $next($request);
    }
}
