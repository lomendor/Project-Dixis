<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaxRateSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tax_rates')->truncate();

        DB::table('tax_rates')->insert([
            'name' => 'VAT-24',
            'rate_percent' => 24.00,
            'is_default' => true,
            'valid_from' => now(),
            'valid_to' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('tax_rates')->insert([
            'name' => 'VAT-13',
            'rate_percent' => 13.00,
            'is_default' => false,
            'valid_from' => now(),
            'valid_to' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('tax_rates')->insert([
            'name' => 'VAT-6',
            'rate_percent' => 6.00,
            'is_default' => false,
            'valid_from' => now(),
            'valid_to' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
