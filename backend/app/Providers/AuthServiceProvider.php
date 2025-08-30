<?php

namespace App\Providers;

use App\Models\Product;
use App\Models\Order;
use App\Policies\ProductPolicy;
use App\Policies\OrderPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Product::class => ProductPolicy::class,
        Order::class => OrderPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Basic role-based gates
        Gate::define('admin-access', fn ($user) => $user->role === 'admin');
        Gate::define('producer-access', fn ($user) => $user->role === 'producer' || $user->role === 'admin');
        Gate::define('consumer-access', fn ($user) => $user->role === 'consumer' || $user->role === 'admin');
        
        // Specific action gates
        Gate::define('create-products', fn ($user) => $user->role === 'producer' || $user->role === 'admin');
        Gate::define('create-orders', fn ($user) => $user->role === 'consumer' || $user->role === 'admin');
    }
}