<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Disallow accidental live HTTP requests during tests (CI safety)
        if (class_exists(\Illuminate\Support\Facades\Http::class)) {
            \Illuminate\Support\Facades\Http::preventStrayRequests();
        }
    }
}
