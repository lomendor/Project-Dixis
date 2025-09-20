<?php

namespace Tests\Unit\Factories;

use Tests\TestCase;
use App\Models\CartItem;
use App\Models\Shipment;

class FactoriesSmokeTest extends TestCase
{
    public function test_cart_item_factory_builds_required_fields()
    {
        $ci = CartItem::factory()->make();
        $this->assertNotNull($ci->user_id);
        $this->assertNotNull($ci->product_id);
        $this->assertGreaterThanOrEqual(1, $ci->quantity);
    }

    public function test_shipment_factory_defaults_status_pending()
    {
        $s = Shipment::factory()->make();
        $this->assertEquals('pending', $s->status);
    }
}