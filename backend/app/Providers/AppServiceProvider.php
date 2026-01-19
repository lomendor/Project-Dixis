<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
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

        $this->configureRateLimiting();
    }

    /**
     * Configure the rate limiters for the application.
     * Pass SEC-AUTH-RL-02: Rate limit auth endpoints to prevent brute force.
     */
    protected function configureRateLimiting(): void
    {
        // Login: 10 attempts per minute, keyed by IP + normalized email
        RateLimiter::for('auth-login', function (Request $request) {
            $email = strtolower(trim($request->input('email', '')));
            $key = $email ? $request->ip() . '|' . $email : $request->ip();

            return Limit::perMinute(10)->by($key);
        });

        // Register: 5 attempts per minute per IP (stricter to prevent spam)
        RateLimiter::for('auth-register', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });
    }
}
