<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind locker provider interface to mock implementation
        $this->app->bind(
            \App\Services\Lockers\LockerProvider::class,
            \App\Services\Lockers\MockBoxNowProvider::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::define('commission_engine_v1', fn()=>false);
    }
}
