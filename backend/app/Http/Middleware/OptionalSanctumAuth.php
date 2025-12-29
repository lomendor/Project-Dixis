<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            // Try to authenticate with Sanctum
            // This sets auth()->user() if token is valid
            try {
                Auth::guard('sanctum')->authenticate();
            } catch (\Exception $e) {
                // Invalid token - continue as guest (don't block request)
                // Log for debugging but don't expose details
                \Log::debug('OptionalSanctumAuth: Invalid token, continuing as guest');
            }
        }

        return $next($request);
    }
}
