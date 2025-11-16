<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class FeeRulesSeeder extends Seeder
{
    public function run(): void
    {
        // Απενεργοποιούμε παλιούς ενεργούς κανόνες (ασφαλές soft deactivation)
        if (DB::getSchemaBuilder()->hasTable('fee_rules')) {
            DB::table('fee_rules')->update(['is_active' => false]);
        }

        $now = Carbon::now();

        // B2C rule (12%)
        $b2cExists = DB::table('fee_rules')
            ->where('channel', 'b2c')
            ->whereNull('producer_id')
            ->whereNull('category_id')
            ->exists();

        if (!$b2cExists) {
            DB::table('fee_rules')->insert([
                'channel'        => 'b2c',
                'rate'           => 0.12,   // 12%
                'fee_vat_rate'   => 0.24,   // 24% ΦΠΑ επί της προμήθειας
                'effective_from' => $now,
                'is_active'      => true,
                'created_at'     => $now,
                'updated_at'     => $now,
            ]);
        }

        // B2B rule (7%)
        $b2bExists = DB::table('fee_rules')
            ->where('channel', 'b2b')
            ->whereNull('producer_id')
            ->whereNull('category_id')
            ->exists();

        if (!$b2bExists) {
            DB::table('fee_rules')->insert([
                'channel'        => 'b2b',
                'rate'           => 0.07,   // 7%
                'fee_vat_rate'   => 0.24,
                'effective_from' => $now,
                'is_active'      => true,
                'created_at'     => $now,
                'updated_at'     => $now,
            ]);
        }
    }
}
