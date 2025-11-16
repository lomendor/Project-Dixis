<?php

namespace Tests\Feature\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\CommissionService;
use App\Models\CommissionRule;
use Laravel\Pennant\Feature;

class CommissionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void {
        parent::setUp();
        // migrations already run by RefreshDatabase
    }

    private function makeCtx($over=[]) {
        return (object) array_merge([
            'channel'=>'B2C',
            'producer_id'=>null,
            'category_ids'=>[],
            'line_total_cents'=>10000
        ], $over);
    }

    public function test_flag_off_returns_zero() {
        Feature::define('commission_engine_v1', fn()=>false);
        $svc = new CommissionService();
        $res = $svc->calculate($this->makeCtx());
        $this->assertSame(0, $res['cents']);
        $this->assertNull($res['rule_id']);
    }

    public function test_simple_percent_rule() {
        Feature::define('commission_engine_v1', fn()=>true);
        CommissionRule::create([
            'scope_channel'=>'B2C','percent'=>12,'tier_min_amount_cents'=>0,
            'vat_mode'=>'EXCLUDE','rounding_mode'=>'NEAREST',
            'effective_from'=>now(),'active'=>true
        ]);
        $svc = new CommissionService();
        $res = $svc->calculate($this->makeCtx(['line_total_cents'=>20000]));
        $this->assertSame(2400, $res['cents']); // 12% of 20000
    }

    public function test_volume_tiers_and_priority() {
        Feature::define('commission_engine_v1', fn()=>true);
        CommissionRule::create([
            'scope_channel'=>'B2C','percent'=>15,'tier_min_amount_cents'=>0,'tier_max_amount_cents'=>5000,
            'vat_mode'=>'EXCLUDE','rounding_mode'=>'NEAREST','effective_from'=>now(),'priority'=>0,'active'=>true
        ]);
        CommissionRule::create([
            'scope_channel'=>'B2C','percent'=>10,'tier_min_amount_cents'=>5001,
            'vat_mode'=>'EXCLUDE','rounding_mode'=>'NEAREST','effective_from'=>now(),'priority'=>0,'active'=>true
        ]);
        $svc = new CommissionService();
        $res1 = $svc->calculate($this->makeCtx(['line_total_cents'=>4000]));
        $res2 = $svc->calculate($this->makeCtx(['line_total_cents'=>8000]));
        $this->assertSame(600, $res1['cents']); // 15% of 4000
        $this->assertSame(800, $res2['cents']); // 10% of 8000
    }

    public function test_vat_include_applies() {
        Feature::define('commission_engine_v1', fn()=>true);
        CommissionRule::create([
            'scope_channel'=>'B2C','percent'=>10,'tier_min_amount_cents'=>0,
            'vat_mode'=>'INCLUDE','rounding_mode'=>'NEAREST','effective_from'=>now(),'active'=>true
        ]);
        $svc = new CommissionService();
        $res = $svc->calculate($this->makeCtx(['line_total_cents'=>10000]));
        $this->assertSame(1240, $res['cents']); // 10% * 1.24
    }

    public function test_effective_dates_respected() {
        Feature::define('commission_engine_v1', fn()=>true);
        CommissionRule::create([
            'scope_channel'=>'B2C','percent'=>20,'tier_min_amount_cents'=>0,
            'vat_mode'=>'EXCLUDE','rounding_mode'=>'NEAREST',
            'effective_from'=>now()->subMonth(),'effective_to'=>now()->subDay(),'active'=>true
        ]);
        CommissionRule::create([
            'scope_channel'=>'B2C','percent'=>12,'tier_min_amount_cents'=>0,
            'vat_mode'=>'EXCLUDE','rounding_mode'=>'NEAREST',
            'effective_from'=>now(),'active'=>true
        ]);
        $svc = new CommissionService();
        $res = $svc->calculate($this->makeCtx(['line_total_cents'=>10000]));
        $this->assertSame(1200, $res['cents']); // not 20%
    }
}
