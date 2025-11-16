<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Pennant\Feature;

class FeatureFlagHealthTest extends TestCase
{
    use RefreshDatabase;

    public function test_commission_engine_v1_defaults_to_off()
    {
        // Feature flag should default to OFF for safety
        $this->assertFalse(
            Feature::active('commission_engine_v1'),
            'commission_engine_v1 flag must default to OFF'
        );
    }

    public function test_commission_engine_v1_can_be_toggled()
    {
        // Verify flag can be turned ON when needed
        Feature::activate('commission_engine_v1');
        $this->assertTrue(Feature::active('commission_engine_v1'));

        // Verify flag can be turned OFF
        Feature::deactivate('commission_engine_v1');
        $this->assertFalse(Feature::active('commission_engine_v1'));
    }

    public function test_commission_engine_v1_is_isolated()
    {
        // Toggling this flag should not affect other features
        Feature::activate('commission_engine_v1');
        
        // Verify it's independent (not affecting non-existent flags)
        $this->assertFalse(
            Feature::active('some_other_feature'),
            'commission_engine_v1 should not enable other flags'
        );
    }
}
