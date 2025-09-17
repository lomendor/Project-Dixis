<?php

namespace Tests\Unit\Courier;

use App\Services\Courier\AcsCourierProvider;
use App\Services\Courier\CourierProviderFactory;
use App\Services\Courier\InternalCourierProvider;
use App\Services\ShippingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CourierProviderFactoryTest extends TestCase
{
    use RefreshDatabase;

    private CourierProviderFactory $factory;

    protected function setUp(): void
    {
        parent::setUp();

        // Mock ACS API responses for factory tests
        Http::fake([
            'sandbox-api.acs.gr/v1/zones' => Http::response(['zones' => []], 200),
            'sandbox-api.acs.gr/v1/shipments' => Http::response([
                'shipment_id' => 'ACS123456789',
                'tracking_code' => 'ACS123456789',
                'label_pdf_url' => 'https://sandbox-api.acs.gr/v1/labels/ACS123456789.pdf',
                'status' => 'created',
            ], 201),
        ]);

        $shippingService = app(ShippingService::class);
        $this->factory = new CourierProviderFactory($shippingService);
    }

    public function test_creates_internal_provider_when_none_configured()
    {
        config(['services.courier.provider' => 'none']);

        $provider = $this->factory->make();

        $this->assertInstanceOf(InternalCourierProvider::class, $provider);
        $this->assertEquals('internal', $provider->getProviderCode());
        $this->assertTrue($provider->isHealthy());
    }

    public function test_creates_internal_provider_as_default()
    {
        config(['services.courier.provider' => null]);

        $provider = $this->factory->make();

        $this->assertInstanceOf(InternalCourierProvider::class, $provider);
        $this->assertEquals('internal', $provider->getProviderCode());
    }

    public function test_creates_acs_provider_when_configured()
    {
        config([
            'services.courier.provider' => 'acs',
            'services.acs.api_key' => 'test_key',
            'services.acs.client_id' => 'test_client',
        ]);

        $provider = $this->factory->make();

        $this->assertInstanceOf(AcsCourierProvider::class, $provider);
        $this->assertEquals('acs', $provider->getProviderCode());
    }

    public function test_falls_back_to_internal_when_acs_unhealthy()
    {
        config([
            'services.courier.provider' => 'acs',
            'services.acs.api_key' => '', // Missing API key makes provider unhealthy
            'services.acs.client_id' => '',
        ]);

        $provider = $this->factory->make();

        // Should fallback to internal provider when ACS is unhealthy
        $this->assertInstanceOf(InternalCourierProvider::class, $provider);
        $this->assertEquals('internal', $provider->getProviderCode());
    }

    public function test_throws_exception_for_unimplemented_providers()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('ELTA provider not implemented yet');

        config(['services.courier.provider' => 'elta']);

        $this->factory->make();
    }

    public function test_returns_available_providers_list()
    {
        $providers = $this->factory->getAvailableProviders();

        $this->assertIsArray($providers);
        $this->assertArrayHasKey('none', $providers);
        $this->assertArrayHasKey('internal', $providers);
        $this->assertArrayHasKey('acs', $providers);
        $this->assertEquals('Internal PDF Provider', $providers['none']);
        $this->assertEquals('ACS Courier', $providers['acs']);
    }

    public function test_health_check_returns_status_for_all_providers()
    {
        config([
            'services.acs.api_key' => 'test_key',
            'services.acs.client_id' => 'test_client',
        ]);

        $healthCheck = $this->factory->healthCheck();

        $this->assertIsArray($healthCheck);
        $this->assertArrayHasKey('internal', $healthCheck);
        $this->assertArrayHasKey('acs', $healthCheck);

        // Internal provider should always be healthy
        $this->assertTrue($healthCheck['internal']['healthy']);
        $this->assertEquals('internal', $healthCheck['internal']['provider_code']);

        // ACS provider should be healthy with proper config
        $this->assertTrue($healthCheck['acs']['healthy']);
        $this->assertEquals('acs', $healthCheck['acs']['provider_code']);
    }

    public function test_health_check_shows_unhealthy_acs_without_config()
    {
        config([
            'services.acs.api_key' => '',
            'services.acs.client_id' => '',
        ]);

        $healthCheck = $this->factory->healthCheck();

        // ACS provider should be unhealthy without proper config
        $this->assertFalse($healthCheck['acs']['healthy']);
    }
}