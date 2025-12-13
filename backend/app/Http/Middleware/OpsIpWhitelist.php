<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * OPS IP Whitelist Middleware
 *
 * Restricts access to OPS/admin endpoints based on IP whitelist.
 *
 * Usage:
 * - Set OPS_TRUSTED_IPS in .env: "127.0.0.1,10.0.0.5,YOUR_OFFICE_IP"
 * - Apply to routes: Route::middleware('ops.ip')->get('/ops/metrics', ...)
 *
 * Security:
 * - If OPS_TRUSTED_IPS not set → allows all (for dev/local)
 * - If OPS_TRUSTED_IPS set → blocks non-whitelisted IPs with 403
 */
class OpsIpWhitelist
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $trustedIps = env('OPS_TRUSTED_IPS', '');

        // If no whitelist configured, allow all (dev mode)
        if (empty($trustedIps)) {
            return $next($request);
        }

        // Parse comma-separated IPs
        $allowedIps = array_map('trim', explode(',', $trustedIps));

        // Get client IP (handle proxies via X-Forwarded-For)
        $clientIp = $request->header('X-Forwarded-For')
            ? explode(',', $request->header('X-Forwarded-For'))[0]
            : $request->ip();

        // Check if IP is whitelisted
        if (!in_array($clientIp, $allowedIps, true)) {
            \Log::warning('[OPS IP Whitelist] Blocked access', [
                'ip' => $clientIp,
                'path' => $request->path(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'error' => 'Access denied: IP not whitelisted'
            ], 403);
        }

        return $next($request);
    }
}
