<?php

namespace Tests\Feature\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\TaxService;
use App\Models\TaxRate;

class TaxServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        TaxRate::factory()->create([
            'name' => 'VAT-24',
            'rate_percent' => 24.00,
            'is_default' => true,
        ]);
    }

    public function test_default_rate_is_24()
    {
        $svc = new TaxService();
        $this->assertEquals(24.00, $svc->getDefaultRatePercent());
    }

    public function test_apply_vat_include_adds_multiplier()
    {
        $svc = new TaxService();
        $res = $svc->applyVat(10000, 'INCLUDE'); // ποσό σε cents style float (ή integer)
        $this->assertEquals(12400, round($res)); // 24% πάνω
    }

    public function test_switch_default_to_13_percent()
    {
        // αλλάζουμε default
        TaxRate::query()->update(['is_default' => false]);
        TaxRate::create([
            'name' => 'VAT-13',
            'rate_percent' => 13.00,
            'is_default' => true,
        ]);

        $svc = new TaxService();
        $this->assertEquals(13.00, $svc->getDefaultRatePercent());
        $this->assertEquals(11300, round($svc->applyVat(10000, 'INCLUDE')));
    }
}
