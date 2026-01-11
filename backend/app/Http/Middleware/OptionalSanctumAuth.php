<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

/**
 * Optional Sanctum Authentication Middleware
 *
 * If a valid Bearer token is present, authenticates the user (fills auth()).
 * If no token or invalid token, allows request to continue as guest.
 *
 * Use case: Public endpoints that should capture user_id when logged in,
 * but still allow guest access (e.g., order creation).
 *
 * @see Pass 52 fix: Orders created by logged-in users now get correct user_id
 * @see Pass 53 fix: Use PersonalAccessToken::findToken() for reliable token auth
 */
class OptionalSanctumAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if Authorization header exists with Bearer token
        $token = $request->bearerToken();

        if ($token) {
            // Try to authenticate with Sanctum Personal Access Token
            try {
                // Find the token in the database
                $accessToken = PersonalAccessToken::findToken($token);

                if ($accessToken) {
                    // Token is valid - set the authenticated user
                    $user = $accessToken->tokenable;
                    Auth::setUser($user);

                    // Update last used timestamp (optional, for token activity tracking)
                    $accessToken->forceFill(['last_used_at' => now()])->save();

                    \Log::info('OptionalSanctumAuth: Authenticated user', ['user_id' => $user->id]);
                } else {
                    \Log::debug('OptionalSanctumAuth: Token not found in database');
                }
            } catch (\Exception $e) {
                // Invalid token - continue as guest (don't block request)
                \Log::warning('OptionalSanctumAuth: Token validation error', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $next($request);
    }
}
