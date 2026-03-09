<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * B2B PIVOT: Admin management of business buyer accounts.
 * Auth enforced by route middleware (jwt.admin + admin).
 */
class AdminBusinessController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'all');
        $perPage = $request->query('per_page', 20);

        $query = Business::with('user:id,name,email,created_at')
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $businesses = $query->paginate($perPage);

        return response()->json([
            'data' => $businesses->items(),
            'total' => $businesses->total(),
            'last_page' => $businesses->lastPage(),
        ]);
    }

    public function approve(Request $request, Business $business): JsonResponse
    {
        $business->update([
            'status' => Business::STATUS_ACTIVE,
            'rejection_reason' => null,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Business approved',
            'business' => $business->fresh()->load('user:id,name,email'),
        ]);
    }

    public function reject(Request $request, Business $business): JsonResponse
    {
        $request->validate(['rejection_reason' => 'required|string|max:1000']);

        $business->update([
            'status' => Business::STATUS_REJECTED,
            'rejection_reason' => $request->input('rejection_reason'),
        ]);

        return response()->json([
            'message' => 'Business rejected',
            'business' => $business->fresh()->load('user:id,name,email'),
        ]);
    }

    public function show(Request $request, Business $business): JsonResponse
    {
        return response()->json([
            'business' => $business->load('user:id,name,email,created_at'),
        ]);
    }
}
