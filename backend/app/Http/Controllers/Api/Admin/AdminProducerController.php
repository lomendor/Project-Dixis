<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProducerController extends Controller
{
    /**
     * PRODUCER-ONBOARD-01: List producers with optional status filter
     *
     * Query params:
     * - status: pending|active|inactive|all (default: all)
     * - page: int (default 1)
     * - per_page: int (default 20, max 100)
     */
    public function index(Request $request): JsonResponse
    {
        if (! $request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'nullable|string|in:pending,active,inactive,all',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $status = $request->query('status', 'all');
        $perPage = $request->query('per_page', 20);

        $query = Producer::with('user:id,name,email,created_at')
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $producers = $query->paginate($perPage);

        return response()->json([
            'data' => $producers->items(),
            'current_page' => $producers->currentPage(),
            'per_page' => $producers->perPage(),
            'total' => $producers->total(),
            'last_page' => $producers->lastPage(),
        ]);
    }

    /**
     * PRODUCER-ONBOARD-01: Approve a pending producer
     */
    public function approve(Request $request, Producer $producer): JsonResponse
    {
        if (! $request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $producer->update([
            'status' => 'active',
            'is_active' => true,
            'rejection_reason' => null,
        ]);

        return response()->json([
            'message' => 'Producer approved successfully',
            'producer' => $producer->fresh(),
        ]);
    }

    /**
     * PRODUCER-ONBOARD-01: Reject a producer application
     */
    public function reject(Request $request, Producer $producer): JsonResponse
    {
        if (! $request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $producer->update([
            'status' => 'inactive',
            'is_active' => false,
            'rejection_reason' => $request->input('rejection_reason'),
        ]);

        return response()->json([
            'message' => 'Producer rejected',
            'producer' => $producer->fresh(),
        ]);
    }
}
