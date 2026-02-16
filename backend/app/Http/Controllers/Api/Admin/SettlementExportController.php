<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommissionSettlement;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Pass PAYOUT-05: CSV export of settlements for bank transfer batch.
 *
 * Exports pending settlements as CSV with IBAN, amount, producer name.
 * Admin downloads this → uploads to bank portal → marks settlements as paid.
 */
class SettlementExportController extends Controller
{
    public function exportCsv(Request $request): StreamedResponse
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $status = strtoupper($request->query('status', 'PENDING'));

        $settlements = CommissionSettlement::with('producer:id,name,iban,bank_account_holder')
            ->where('status', $status)
            ->orderBy('producer_id')
            ->get();

        $filename = 'dixis-settlements-' . strtolower($status) . '-' . now()->format('Y-m-d') . '.csv';

        return new StreamedResponse(function () use ($settlements) {
            $handle = fopen('php://output', 'w');

            // BOM for Excel UTF-8 compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            // Header row
            fputcsv($handle, [
                'Settlement ID',
                'Producer ID',
                'Producer Name',
                'IBAN',
                'Account Holder',
                'Period Start',
                'Period End',
                'Orders',
                'Total Sales (EUR)',
                'Commission (EUR)',
                'Net Payout (EUR)',
                'Status',
            ], ';'); // Semicolon delimiter for EU Excel

            foreach ($settlements as $s) {
                fputcsv($handle, [
                    $s->id,
                    $s->producer_id,
                    $s->producer?->name ?? '',
                    $s->producer?->iban ?? '',
                    $s->producer?->bank_account_holder ?? '',
                    $s->period_start->toDateString(),
                    $s->period_end->toDateString(),
                    $s->order_count,
                    number_format($s->total_sales_cents / 100, 2, '.', ''),
                    number_format($s->commission_cents / 100, 2, '.', ''),
                    number_format($s->net_payout_cents / 100, 2, '.', ''),
                    $s->status,
                ], ';');
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'no-cache, no-store',
        ]);
    }
}
