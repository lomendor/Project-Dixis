<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommissionSettlement;
use Illuminate\Http\Request;

/**
 * Pass PAYOUT-03: Admin settlement dashboard endpoints.
 * List settlements, view details, mark as paid/cancelled.
 */
class AdminSettlementController extends Controller
{
    private function adminGuard(Request $request): void
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
    }

    /** GET /admin/settlements — List all settlements with producer info */
    public function index(Request $request)
    {
        $this->adminGuard($request);

        $query = CommissionSettlement::with('producer:id,name,iban,bank_account_holder')
            ->orderByDesc('period_end');

        // Optional filters
        if ($status = $request->query('status')) {
            $query->where('status', strtoupper($status));
        }
        if ($producerId = $request->query('producer_id')) {
            $query->where('producer_id', $producerId);
        }

        $settlements = $query->paginate(25);

        return response()->json([
            'success' => true,
            'settlements' => $settlements->items(),
            'meta' => [
                'current_page' => $settlements->currentPage(),
                'last_page' => $settlements->lastPage(),
                'total' => $settlements->total(),
            ],
        ]);
    }

    /** GET /admin/settlements/{id} — Settlement detail with linked commissions */
    public function show(Request $request, $id)
    {
        $this->adminGuard($request);

        $settlement = CommissionSettlement::with([
            'producer:id,name,iban,bank_account_holder',
            'commissions.order:id,public_token,status,total,created_at',
        ])->findOrFail($id);

        return response()->json(['success' => true, 'settlement' => $settlement]);
    }

    /** POST /admin/settlements/{id}/pay — Mark settlement as paid */
    public function markPaid(Request $request, $id)
    {
        $this->adminGuard($request);
        $request->validate(['notes' => 'nullable|string|max:500']);

        $settlement = CommissionSettlement::findOrFail($id);

        if ($settlement->status !== CommissionSettlement::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'error' => "Cannot pay settlement with status: {$settlement->status}",
            ], 422);
        }

        $settlement->markAsPaid($request->input('notes'));

        return response()->json([
            'success' => true,
            'settlement' => $settlement->fresh()->load('producer:id,name'),
        ]);
    }

    /** POST /admin/settlements/{id}/cancel — Mark settlement as cancelled */
    public function markCancelled(Request $request, $id)
    {
        $this->adminGuard($request);
        $request->validate(['notes' => 'required|string|max:500']);

        $settlement = CommissionSettlement::findOrFail($id);

        if ($settlement->status !== CommissionSettlement::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'error' => "Cannot cancel settlement with status: {$settlement->status}",
            ], 422);
        }

        $settlement->markAsCancelled($request->input('notes'));

        return response()->json([
            'success' => true,
            'settlement' => $settlement->fresh()->load('producer:id,name'),
        ]);
    }

    /** GET /admin/settlements/summary — Quick stats for dashboard header */
    public function summary(Request $request)
    {
        $this->adminGuard($request);

        $pending = CommissionSettlement::pending()->selectRaw(
            'COUNT(*) as count, COALESCE(SUM(net_payout_cents), 0) as total_cents'
        )->first();

        $paid = CommissionSettlement::paid()->selectRaw(
            'COUNT(*) as count, COALESCE(SUM(net_payout_cents), 0) as total_cents'
        )->first();

        return response()->json([
            'success' => true,
            'summary' => [
                'pending_count' => $pending->count ?? 0,
                'pending_total_eur' => ($pending->total_cents ?? 0) / 100,
                'paid_count' => $paid->count ?? 0,
                'paid_total_eur' => ($paid->total_cents ?? 0) / 100,
            ],
        ]);
    }
}
