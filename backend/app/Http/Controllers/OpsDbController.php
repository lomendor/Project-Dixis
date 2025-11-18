<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class OpsDbController extends Controller
{
    public function slow(Request $request): JsonResponse
    {
        // Απλή προστασία: απαιτείται X-Ops-Key να ταιριάζει με OPS_KEY
        if (app()->environment('production')) {
            $hdr = $request->header('X-Ops-Key');
            $key = config('ops.key');
            if (!$key || $hdr !== $key) {
                abort(403, 'Forbidden');
            }
        }

        // Έλεγχος αν η επέκταση υπάρχει
        $installed = false;
        try {
            $installed = (bool) DB::selectOne("
                SELECT EXISTS(
                  SELECT 1 FROM pg_available_extensions
                  WHERE name='pg_stat_statements' AND installed_version IS NOT NULL
                ) AS ok
            ")->ok;
        } catch (\Throwable $e) {
            $installed = false;
        }

        if (!$installed) {
            return response()->json([
                'ok' => true,
                'extension' => 'pg_stat_statements',
                'installed' => false,
                'note' => 'Extension not installed/available. Migration attempted to enable; check DB privileges.',
                'top' => [],
            ], 200);
        }

        // Φέρε top N queries βάσει mean_time (εξαιρεί πολύ μικρά βοηθητικά)
        $limit = (int)($request->query('limit', 10));
        $limit = max(1, min($limit, 50));

        $rows = DB::select("
            SELECT query, calls, total_time, mean_time, rows
            FROM pg_stat_statements
            WHERE calls > 0
            ORDER BY mean_time DESC
            LIMIT $limit
        ");

        return response()->json([
            'ok' => true,
            'extension' => 'pg_stat_statements',
            'installed' => true,
            'top' => $rows,
        ], 200);
    }
}
