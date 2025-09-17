<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Shipment>
 */
class ShipmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(['pending', 'labeled', 'shipped', 'in_transit', 'delivered', 'failed']);
        $carrierCode = fake()->randomElement(['ELTA', 'ACS', 'SPEEDEX']);
        $zoneCode = fake()->randomElement(['GR_ATTICA', 'GR_THESSALONIKI', 'GR_MAINLAND', 'GR_CRETE', 'GR_ISLANDS_LARGE']);

        // Generate tracking code similar to ShippingService
        $trackingCode = 'DX'.substr(time(), -6).str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);

        $shippedAt = $status === 'pending' || $status === 'labeled' ? null : fake()->dateTimeBetween('-7 days', 'now');
        $deliveredAt = $status === 'delivered' ? ($shippedAt ? fake()->dateTimeBetween($shippedAt, 'now') : fake()->dateTimeBetween('-3 days', 'now')) : null;

        return [
            'order_id' => Order::factory(),
            'carrier_code' => $carrierCode,
            'tracking_code' => $trackingCode,
            'label_url' => $status !== 'pending' ? "storage/shipping/labels/shipping_label_{fake()->randomNumber(6)}_{$trackingCode}.pdf" : null,
            'status' => $status,
            'billable_weight_kg' => fake()->randomFloat(2, 0.1, 50.0),
            'zone_code' => $zoneCode,
            'shipping_cost_eur' => fake()->randomFloat(2, 3.50, 25.00),
            'tracking_events' => $status === 'pending' || $status === 'labeled' ? [] : [
                [
                    'timestamp' => $shippedAt?->format('Y-m-d H:i:s'),
                    'status' => 'shipped',
                    'location' => 'Athens, Greece',
                    'description' => 'Package shipped from warehouse',
                ],
            ],
            'shipped_at' => $shippedAt,
            'delivered_at' => $deliveredAt,
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    /**
     * Indicate that the shipment is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'label_url' => null,
            'shipped_at' => null,
            'delivered_at' => null,
            'tracking_events' => [],
        ]);
    }

    /**
     * Indicate that the shipment is in transit.
     */
    public function inTransit(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_transit',
            'shipped_at' => fake()->dateTimeBetween('-3 days', 'now'),
            'delivered_at' => null,
        ]);
    }

    /**
     * Indicate that the shipment is delivered.
     */
    public function delivered(): static
    {
        $shippedAt = fake()->dateTimeBetween('-7 days', '-1 day');

        return $this->state(fn (array $attributes) => [
            'status' => 'delivered',
            'shipped_at' => $shippedAt,
            'delivered_at' => fake()->dateTimeBetween($shippedAt, 'now'),
        ]);
    }
}
