<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommissionRuleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('commission_rules')->truncate();

        // Default B2C: 12%
        DB::table('commission_rules')->insert([
            'scope_channel' => 'B2C',
            'percent' => 12.00,
            'tier_min_amount_cents' => 0,
            'vat_mode' => 'EXCLUDE',
            'rounding_mode' => 'NEAREST',
            'effective_from' => now(),
            'priority' => 0,
            'active' => true,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        // Default B2B: 7%
        DB::table('commission_rules')->insert([
            'scope_channel' => 'B2B',
            'percent' => 7.00,
            'tier_min_amount_cents' => 0,
            'vat_mode' => 'EXCLUDE',
            'rounding_mode' => 'NEAREST',
            'effective_from' => now(),
            'priority' => 0,
            'active' => true,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        // Volume για B2C: >100€ -> 10%
        DB::table('commission_rules')->insert([
            'scope_channel' => 'B2C',
            'percent' => 10.00,
            'tier_min_amount_cents' => 10000, // 100€
            'vat_mode' => 'EXCLUDE',
            'rounding_mode' => 'NEAREST',
            'effective_from' => now(),
            'priority' => 1,
            'active' => true,
            'created_at' => now(), 'updated_at' => now(),
        ]);
    }
}
