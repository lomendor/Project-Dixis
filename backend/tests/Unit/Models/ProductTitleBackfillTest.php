<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Producer;

class ProductTitleBackfillTest extends TestCase
{
    public function test_creating_product_backfills_title_from_name()
    {
        $producer = Producer::factory()->create();
        $p = Product::create([
            'producer_id' => $producer->id,
            'name' => 'Unit Test Product',
            // 'title' intentionally missing
            'slug' => 'unit-test-product',
            'price' => 9.99,
            'unit' => 'pc',
            'stock' => 5,
            'status' => 'active',
        ]);
        $this->assertEquals('Unit Test Product', $p->title);
    }
}