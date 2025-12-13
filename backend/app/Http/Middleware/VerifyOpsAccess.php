<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyOpsAccess
{
    /**
     * Handle an incoming request to OPS endpoints.
     *
     * Validates:
     * 1. OPS token from X-Ops-Token header
     * 2. (Optional) Client IP whitelist
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Validate OPS token
        $opsToken = config('ops.token');
        $requestToken = $request->header('X-Ops-Token');

        if (!$opsToken || $requestToken !== $opsToken) {
            return response()->json([
                'error' => 'OPS access denied',
                'message' => 'Invalid or missing OPS token'
            ], 403);
        }

        // 2. Validate IP whitelist (optional)
        $allowedIps = config('ops.allowed_ips');

        if ($allowedIps) {
            $ips = is_array($allowedIps)
                ? $allowedIps
                : array_map('trim', explode(',', $allowedIps));

            $clientIp = $request->ip();

            if (!in_array($clientIp, $ips)) {
                return response()->json([
                    'error' => 'OPS access denied',
                    'message' => 'IP address not whitelisted',
                    'client_ip' => $clientIp
                ], 403);
            }
        }

        return $next($request);
    }
}
