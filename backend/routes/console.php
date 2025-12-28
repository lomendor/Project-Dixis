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
