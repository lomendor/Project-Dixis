<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Shipment;
use App\Models\Order;

class ShipmentFactory extends Factory
{
    protected $model = Shipment::class;

    public function definition(): array
    {
        return [
            'order_id'     => Order::factory(),
            'carrier_code' => 'INTERNAL',
            'tracking_code'=> strtoupper($this->faker->bothify('TRK########')),
            'status'       => 'pending',
            'label_url'    => null,
        ];
    }
}