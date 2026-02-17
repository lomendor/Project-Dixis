<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * T2.5-01: Centralized admin role gate.
 *
 * Applied to all admin/* and refunds/* route groups so that
 * a customer or producer token can never reach admin endpoints.
 * Individual controllers may still contain inline checks as
 * defense-in-depth — this middleware is the first barrier.
 */
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'error' => 'forbidden',
                'message' => 'Admin access required.',
            ], 403);
        }

        return $next($request);
    }
}
