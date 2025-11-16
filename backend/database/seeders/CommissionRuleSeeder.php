<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommissionRuleSeeder extends Seeder
{
    public function run(): void
    {
        // Idempotent upserts (όχι truncate) για ασφάλεια στα CI/prod
        $now = now();

        $rows = [
            [
                'scope_channel' => 'B2C',
                'percent' => 12.00,
                'tier_min_amount_cents' => 0,
                'vat_mode' => 'EXCLUDE',
                'rounding_mode' => 'NEAREST',
                'priority' => 0, 'active' => true,
            ],
            [
                'scope_channel' => 'B2B',
                'percent' => 7.00,
                'tier_min_amount_cents' => 0,
                'vat_mode' => 'EXCLUDE',
                'rounding_mode' => 'NEAREST',
                'priority' => 0, 'active' => true,
            ],
            [
                'scope_channel' => 'B2C',
                'percent' => 10.00,
                'tier_min_amount_cents' => 10000, // > €100
                'vat_mode' => 'EXCLUDE',
                'rounding_mode' => 'NEAREST',
                'priority' => 1, 'active' => true,
            ],
        ];

        foreach ($rows as $r) {
            $exists = DB::table('commission_rules')
                ->where('scope_channel', $r['scope_channel'])
                ->where('tier_min_amount_cents', $r['tier_min_amount_cents'])
                ->where('priority', $r['priority'])
                ->exists();

            if (!$exists) {
                DB::table('commission_rules')->insert(array_merge($r, [
                    'effective_from' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]));
            } else {
                DB::table('commission_rules')
                  ->where('scope_channel', $r['scope_channel'])
                  ->where('tier_min_amount_cents', $r['tier_min_amount_cents'])
                  ->where('priority', $r['priority'])
                  ->update(array_merge($r, ['updated_at' => $now]));
            }
        }
    }
}
