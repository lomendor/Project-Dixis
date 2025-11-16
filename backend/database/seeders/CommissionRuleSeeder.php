<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CommissionRule;

class CommissionRuleSeeder extends Seeder
{
    public function run(): void
    {
        CommissionRule::create([
            'scope_channel'=>'B2C','percent'=>12,'tier_min_amount_cents'=>0,
            'vat_mode'=>'EXCLUDE','rounding_mode'=>'NEAREST',
            'effective_from'=>now(),'priority'=>0,'active'=>true
        ]);
        CommissionRule::create([
            'scope_channel'=>'B2B','percent'=>7,'tier_min_amount_cents'=>0,
            'vat_mode'=>'EXCLUDE','rounding_mode'=>'NEAREST',
            'effective_from'=>now(),'priority'=>0,'active'=>true
        ]);
        CommissionRule::create([
            'scope_channel'=>'B2C','percent'=>10,'tier_min_amount_cents'=>10000,
            'vat_mode'=>'EXCLUDE','rounding_mode'=>'NEAREST',
            'effective_from'=>now(),'priority'=>1,'active'=>true
        ]);
    }
}
