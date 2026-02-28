<?php

namespace App\Http\Controllers\Api\Producer;

use App\Http\Controllers\Controller;
use App\Models\CommissionSettlement;
use Illuminate\Http\Request;

/**
 * Pass PAYOUT-04: Producer payout history — list own settlements.
 */
class ProducerSettlementController extends Controller
{
    /** GET /v1/producer/settlements — list settlements for authenticated producer */
    public function index(Request $request)
    {
        $producer = $request->user()?->producer;
        if (!$producer) {
            return response()->json(['message' => 'No producer profile'], 403);
        }

        $settlements = CommissionSettlement::where('producer_id', $producer->id)
            ->orderByDesc('period_end')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'period_start' => $s->period_start->toDateString(),
                'period_end' => $s->period_end->toDateString(),
                'total_sales_eur' => $s->total_sales,
                'commission_eur' => $s->commission_amount,
                'net_payout_eur' => $s->net_payout,
                'order_count' => $s->order_count,
                'status' => $s->status,
                'paid_at' => $s->paid_at?->toISOString(),
            ]);

        // Summary for header
        $pending = $settlements->where('status', 'PENDING');
        $paid = $settlements->where('status', 'PAID');

        return response()->json([
            'success' => true,
            'settlements' => $settlements->values(),
            'summary' => [
                'pending_count' => $pending->count(),
                'pending_total_eur' => round($pending->sum('net_payout_eur'), 2),
                'paid_count' => $paid->count(),
                'paid_total_eur' => round($paid->sum('net_payout_eur'), 2),
                'lifetime_total_eur' => round($paid->sum('net_payout_eur') + $pending->sum('net_payout_eur'), 2),
            ],
        ]);
    }
}
