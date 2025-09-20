<?php

namespace Tests\Feature\Http\Controllers\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LockerControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure clean slate for each test
        config(['shipping.enable_lockers' => false]);
    }

    /** @test */
    public function returns_404_when_locker_feature_is_disabled()
    {
        // Ensure lockers are disabled
        config(['shipping.enable_lockers' => false]);

        $response = $this->getJson('/api/v1/shipping/lockers/search?postal_code=11525');

        $response->assertStatus(404)
                ->assertJson([
                    'success' => false,
                    'message' => 'Lockers are not available'
                ]);
    }

    /** @test */
    public function validates_postal_code_format()
    {
        // Enable lockers for this test
        config(['shipping.enable_lockers' => true]);

        // Test invalid postal codes
        $invalidPostalCodes = ['123', '12345a', 'abcde', '123456', ''];

        foreach ($invalidPostalCodes as $postalCode) {
            $response = $this->getJson("/api/v1/shipping/lockers/search?postal_code={$postalCode}");

            $response->assertStatus(422)
                    ->assertJson([
                        'success' => false,
                        'message' => 'Invalid postal code format'
                    ]);
        }
    }

    /** @test */
    public function returns_422_when_postal_code_is_missing()
    {
        config(['shipping.enable_lockers' => true]);

        $response = $this->getJson('/api/v1/shipping/lockers/search');

        $response->assertStatus(422)
                ->assertJson([
                    'success' => false,
                    'message' => 'Invalid postal code format'
                ]);
    }

    /** @test */
    public function returns_lockers_when_feature_enabled_and_valid_postal_code()
    {
        // Enable lockers
        config(['shipping.enable_lockers' => true]);

        $response = $this->getJson('/api/v1/shipping/lockers/search?postal_code=11525');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'address',
                            'provider',
                            'lat',
                            'lng',
                            'postal_code',
                            'distance',
                            'operating_hours',
                            'notes'
                        ]
                    ]
                ])
                ->assertJson([
                    'success' => true
                ]);

        // Verify we get at least one locker
        $responseData = $response->json();
        $this->assertGreaterThanOrEqual(1, count($responseData['data']));

        // Verify the structure of the first locker
        $firstLocker = $responseData['data'][0];
        $this->assertIsString($firstLocker['id']);
        $this->assertIsString($firstLocker['name']);
        $this->assertIsString($firstLocker['address']);
        $this->assertIsString($firstLocker['provider']);
        $this->assertIsNumeric($firstLocker['lat']);
        $this->assertIsNumeric($firstLocker['lng']);
        $this->assertMatchesRegularExpression('/^\d{5}$/', $firstLocker['postal_code']);
    }

    /** @test */
    public function returns_different_lockers_for_different_postal_codes()
    {
        config(['shipping.enable_lockers' => true]);

        // Test Athens postal code
        $athensResponse = $this->getJson('/api/v1/shipping/lockers/search?postal_code=11525');
        $athensResponse->assertStatus(200);

        // Test Thessaloniki postal code
        $thessalonikiResponse = $this->getJson('/api/v1/shipping/lockers/search?postal_code=54622');
        $thessalonikiResponse->assertStatus(200);

        $athensLockers = $athensResponse->json('data');
        $thessalonikiLockers = $thessalonikiResponse->json('data');

        // Both should return results
        $this->assertGreaterThan(0, count($athensLockers));
        $this->assertGreaterThan(0, count($thessalonikiLockers));

        // Results should be different (at least some different lockers)
        $athensIds = array_column($athensLockers, 'id');
        $thessalonikiIds = array_column($thessalonikiLockers, 'id');

        $this->assertNotEquals($athensIds, $thessalonikiIds);
    }

    /** @test */
    public function handles_postal_codes_with_no_nearby_lockers()
    {
        config(['shipping.enable_lockers' => true]);

        // Use a remote postal code that should have no nearby lockers
        $response = $this->getJson('/api/v1/shipping/lockers/search?postal_code=99999');

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'data' => []
                ]);
    }

    /** @test */
    public function respects_rate_limiting()
    {
        config(['shipping.enable_lockers' => true]);

        // Make many requests quickly (the route has throttle:60,1 middleware)
        $successfulRequests = 0;
        $rateLimitedRequests = 0;

        // Try to exceed the rate limit
        for ($i = 0; $i < 70; $i++) {
            $response = $this->getJson('/api/v1/shipping/lockers/search?postal_code=11525');

            if ($response->status() === 200) {
                $successfulRequests++;
            } elseif ($response->status() === 429) {
                $rateLimitedRequests++;
                break; // Stop once we hit rate limit
            }
        }

        // We should hit the rate limit before making 70 requests
        $this->assertLessThan(70, $successfulRequests);
    }

    /** @test */
    public function returns_valid_locker_data_structure()
    {
        config(['shipping.enable_lockers' => true]);

        $response = $this->getJson('/api/v1/shipping/lockers/search?postal_code=11525');

        $response->assertStatus(200);

        $responseData = $response->json();
        $this->assertTrue($responseData['success']);
        $this->assertIsArray($responseData['data']);

        if (count($responseData['data']) > 0) {
            $locker = $responseData['data'][0];

            // Check required fields
            $this->assertArrayHasKey('id', $locker);
            $this->assertArrayHasKey('name', $locker);
            $this->assertArrayHasKey('address', $locker);
            $this->assertArrayHasKey('provider', $locker);
            $this->assertArrayHasKey('lat', $locker);
            $this->assertArrayHasKey('lng', $locker);
            $this->assertArrayHasKey('postal_code', $locker);

            // Check data types
            $this->assertIsString($locker['id']);
            $this->assertIsString($locker['name']);
            $this->assertIsString($locker['address']);
            $this->assertIsString($locker['provider']);
            $this->assertIsFloat($locker['lat']);
            $this->assertIsFloat($locker['lng']);
            $this->assertIsString($locker['postal_code']);

            // Check optional fields if present
            if (isset($locker['distance'])) {
                $this->assertIsFloat($locker['distance']);
                $this->assertGreaterThanOrEqual(0, $locker['distance']);
            }

            if (isset($locker['operating_hours'])) {
                $this->assertIsString($locker['operating_hours']);
            }

            if (isset($locker['notes'])) {
                $this->assertIsString($locker['notes']);
            }

            // Validate postal code format
            $this->assertMatchesRegularExpression('/^\d{5}$/', $locker['postal_code']);

            // Validate Greek coordinates (approximate bounds)
            $this->assertGreaterThanOrEqual(34.0, $locker['lat']); // Southern Greece
            $this->assertLessThanOrEqual(42.0, $locker['lat']);    // Northern Greece
            $this->assertGreaterThanOrEqual(19.0, $locker['lng']); // Western Greece
            $this->assertLessThanOrEqual(30.0, $locker['lng']);    // Eastern Greece
        }
    }
}