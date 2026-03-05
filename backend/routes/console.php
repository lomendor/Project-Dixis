<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Pass 55: Weekly Producer Digest Schedule
|--------------------------------------------------------------------------
|
| Runs every Monday at 09:00 Europe/Athens time.
| Requires: PRODUCER_DIGEST_ENABLED=true in .env
|
| VPS cron line (if scheduler not set up):
| * * * * * cd /var/www/dixis/current/backend && php artisan schedule:run >> /dev/null 2>&1
|
*/
Schedule::command('producers:digest-weekly')
    ->weeklyOn(1, '09:00')  // Monday at 09:00
    ->timezone('Europe/Athens')
    ->withoutOverlapping()
    ->runInBackground();

/*
|--------------------------------------------------------------------------
| Pass PAYOUT-02: Monthly Settlement Generation
|--------------------------------------------------------------------------
|
| Runs on the 1st of each month at 06:00 Europe/Athens.
| Aggregates delivered orders with 14-day hold into settlements.
| Min payout: €20 (below deferred to next period).
|
*/
Schedule::command('dixis:generate-settlements')
    ->monthlyOn(1, '06:00')  // 1st of month at 06:00
    ->timezone('Europe/Athens')
    ->withoutOverlapping()
    ->runInBackground();

/*
|--------------------------------------------------------------------------
| T4: Daily Low Stock Alerts
|--------------------------------------------------------------------------
|
| Checks all active products with stock <= 5 and emails their producers.
| InventoryService also checks reactively per-product after checkout,
| but this daily sweep catches anything missed.
|
*/
Schedule::call(function () {
    app(\App\Services\InventoryService::class)->checkLowStockAlerts();
})
    ->name('low-stock-check')
    ->dailyAt('08:00')
    ->timezone('Europe/Athens')
    ->withoutOverlapping();

/*
|--------------------------------------------------------------------------
| FIX-ORDER-ESCALATION-01: Check Unaccepted Orders
|--------------------------------------------------------------------------
|
| Runs every minute. If an order is still "pending" after 2 minutes,
| sends an alert email to admin with the producer's phone number.
| Idempotent — won't alert twice for the same order+producer.
|
*/
Schedule::command('orders:check-unaccepted --minutes=2')
    ->everyMinute()
    ->timezone('Europe/Athens')
    ->withoutOverlapping()
    ->runInBackground();

/*
|--------------------------------------------------------------------------
| T4: Prune Expired Sanctum Tokens
|--------------------------------------------------------------------------
*/
Schedule::command('sanctum:prune-expired --hours=48')
    ->daily()
    ->runInBackground();
