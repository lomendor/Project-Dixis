<?php

namespace Tests\Feature\Public;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Producer;
use App\Models\Product;

class ProducersApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void {
        parent::setUp();
        // Αν υπάρχει DatabaseSeeder, τρέξε τον για demo data
        $this->artisan('migrate');
        $this->seed();
    }

    public function test_list_active_producers_returns_paginated_results(): void
    {
        $resp = $this->getJson('/api/v1/public/producers?per_page=5');
        $resp->assertStatus(200)
             ->assertJsonStructure(['data', 'links', 'current_page', 'per_page', 'total']);
    }

    public function test_show_producer_returns_details_with_products(): void
    {
        $producer = Producer::query()->first();
        $resp = $this->getJson('/api/v1/public/producers/'.$producer->id);
        $resp->assertStatus(200)
             ->assertJsonStructure(['id','name','slug','products']);
    }

    public function test_products_list_includes_producer_info(): void
    {
        $resp = $this->getJson('/api/v1/public/products?per_page=5');
        $resp->assertStatus(200)
             ->assertJsonStructure(['data','links','current_page','per_page','total']);
        $first = $resp->json('data')[0] ?? null;
        $this->assertIsArray($first);
        $this->assertArrayHasKey('producer', $first);
        $this->assertIsArray($first['producer']);
        $this->assertArrayHasKey('id', $first['producer']);
        $this->assertArrayHasKey('name', $first['producer']);
    }
}