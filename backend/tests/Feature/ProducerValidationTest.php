<?php

namespace Tests\Feature;

use App\Models\Producer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProducerValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a user for producer relationship
        $this->user = User::factory()->create();
    }

    /**
     * Test creating producer with minimal data passes validation and persists nullable fields as null.
     */
    public function test_create_producer_with_minimal_data(): void
    {
        $data = [
            'name' => 'Test Producer',
            'slug' => 'test-producer',
            'user_id' => $this->user->id,
            'verified' => false,
            'uses_custom_shipping_rates' => false,
        ];

        $producer = Producer::create($data);

        $this->assertDatabaseHas('producers', [
            'name' => 'Test Producer',
            'slug' => 'test-producer',
            'user_id' => $this->user->id,
        ]);

        // Ensure nullable fields are null
        $this->assertNull($producer->tax_id);
        $this->assertNull($producer->address);
        $this->assertNull($producer->social_media);
        $this->assertNull($producer->latitude);
        $this->assertNull($producer->longitude);
        $this->assertFalse($producer->verified);
        $this->assertFalse($producer->uses_custom_shipping_rates);
    }

    /**
     * Test updating producer with tax_id and social_media array works properly.
     */
    public function test_update_producer_with_tax_id_and_social_media(): void
    {
        $producer = Producer::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $updateData = [
            'tax_id' => '123456789',
            'tax_office' => 'Athens DOY',
            'address' => '123 Test Street',
            'city' => 'Athens',
            'postal_code' => '12345',
            'region' => 'Attica',
            'latitude' => 37.9755,
            'longitude' => 23.7348,
            'social_media' => [
                'facebook' => 'https://facebook.com/test',
                'instagram' => 'https://instagram.com/test',
            ],
            'verified' => true,
            'uses_custom_shipping_rates' => true,
        ];

        $producer->update($updateData);
        $producer->refresh();

        $this->assertEquals('123456789', $producer->tax_id);
        $this->assertEquals('Athens DOY', $producer->tax_office);
        $this->assertEquals('123 Test Street', $producer->address);
        $this->assertEquals('Athens', $producer->city);
        $this->assertEquals('12345', $producer->postal_code);
        $this->assertEquals('Attica', $producer->region);
        $this->assertEquals(37.9755, $producer->latitude);
        $this->assertEquals(23.7348, $producer->longitude);

        // Test social_media array cast
        $this->assertIsArray($producer->social_media);
        $this->assertEquals('https://facebook.com/test', $producer->social_media['facebook']);

        // Test boolean casts and is_verified accessor
        $this->assertTrue($producer->verified);
        $this->assertTrue($producer->is_verified); // Tests accessor
        $this->assertTrue($producer->uses_custom_shipping_rates);
    }

    /**
     * Test is_verified accessor works bidirectionally.
     */
    public function test_is_verified_accessor_mutator(): void
    {
        $producer = Producer::factory()->create([
            'user_id' => $this->user->id,
        ]);

        // Test mutator: setting is_verified should update verified
        $producer->is_verified = true;
        $producer->save();
        $producer->refresh();

        $this->assertTrue($producer->verified);
        $this->assertTrue($producer->is_verified);

        // Test accessor: verified field should be accessible via is_verified
        $producer->update(['verified' => false]);
        $producer->refresh();

        $this->assertFalse($producer->verified);
        $this->assertFalse($producer->is_verified);
    }

    /**
     * Test ProducerResource includes new fields in API response.
     */
    public function test_producer_resource_includes_new_fields(): void
    {
        $producer = Producer::factory()->create([
            'user_id' => $this->user->id,
            'tax_id' => '987654321',
            'tax_office' => 'Thessaloniki DOY',
            'address' => '456 Another Street',
            'city' => 'Thessaloniki',
            'postal_code' => '54321',
            'region' => 'Macedonia',
            'latitude' => 40.6401,
            'longitude' => 22.9444,
            'social_media' => ['twitter' => 'https://twitter.com/test'],
            'verified' => true,
            'uses_custom_shipping_rates' => true,
        ]);

        $resource = new \App\Http\Resources\ProducerResource($producer);
        $array = $resource->toArray(request());

        $this->assertArrayHasKey('tax_id', $array);
        $this->assertArrayHasKey('tax_office', $array);
        $this->assertArrayHasKey('address', $array);
        $this->assertArrayHasKey('city', $array);
        $this->assertArrayHasKey('postal_code', $array);
        $this->assertArrayHasKey('region', $array);
        $this->assertArrayHasKey('latitude', $array);
        $this->assertArrayHasKey('longitude', $array);
        $this->assertArrayHasKey('social_media', $array);
        $this->assertArrayHasKey('verified', $array);
        $this->assertArrayHasKey('is_verified', $array);
        $this->assertArrayHasKey('uses_custom_shipping_rates', $array);

        $this->assertEquals('987654321', $array['tax_id']);
        $this->assertTrue($array['verified']);
        $this->assertTrue($array['is_verified']);
        $this->assertIsArray($array['social_media']);
    }
}
