<?php

namespace Database\Factories;

use App\Models\Commission;
use App\Models\Order;
use App\Models\Producer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Commission>
 */
class CommissionFactory extends Factory
{
    protected $model = Commission::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'producer_id' => Producer::factory(),
            'channel' => 'b2c',
            'order_gross' => 100.00,
            'platform_fee' => 12.00,
            'platform_fee_vat' => 2.88,
            'producer_payout' => 88.00,
            'currency' => 'EUR',
            'settlement_id' => null,
        ];
    }
}
