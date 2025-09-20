<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUpTraits()
    {
        // Force SQLite configuration before trait setup
        if (app()->environment('testing')) {
            config([
                'database.default' => 'sqlite',
                'database.connections.sqlite.database' => env('DB_DATABASE', ':memory:'),
            ]);
        }

        $uses = parent::setUpTraits();

        return $uses;
    }
}
