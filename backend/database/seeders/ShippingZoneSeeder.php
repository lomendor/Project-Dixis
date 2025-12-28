<?php

namespace Database\Seeders;

use App\Models\ShippingZone;
use App\Models\ShippingRate;
use Illuminate\Database\Seeder;

/**
 * Pass 50: Seed Greek shipping zones and rates
 */
class ShippingZoneSeeder extends Seeder
{
    public function run(): void
    {
        // Zone 1: Athens Metro (postal prefixes 10-19)
        $athens = ShippingZone::create([
            'name' => 'Αττική',
            'postal_prefixes' => ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
            'is_active' => true,
        ]);

        // Zone 2: Thessaloniki (postal prefixes 54-57)
        $thessaloniki = ShippingZone::create([
            'name' => 'Θεσσαλονίκη',
            'postal_prefixes' => ['54', '55', '56', '57'],
            'is_active' => true,
        ]);

        // Zone 3: Rest of mainland Greece
        $mainland = ShippingZone::create([
            'name' => 'Ηπειρωτική Ελλάδα',
            'postal_prefixes' => [
                '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
                '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
                '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
                '50', '51', '52', '53', '58', '59',
                '60', '61', '62', '63', '64', '65', '66', '67', '68', '69',
            ],
            'is_active' => true,
        ]);

        // Zone 4: Islands (Crete, Cyclades, Dodecanese, etc.)
        $islands = ShippingZone::create([
            'name' => 'Νησιά',
            'postal_prefixes' => [
                '70', '71', '72', '73', '74', // Crete
                '80', '81', '82', '83', '84', '85', // Aegean islands
            ],
            'is_active' => true,
        ]);

        // Create rates for each zone
        // Default weight bucket: 0-30kg (covers most orders)
        $rates = [
            // Athens - cheapest
            ['zone_id' => $athens->id, 'method' => 'HOME', 'price_eur' => 3.50],
            ['zone_id' => $athens->id, 'method' => 'COURIER', 'price_eur' => 4.50],

            // Thessaloniki - slightly more
            ['zone_id' => $thessaloniki->id, 'method' => 'HOME', 'price_eur' => 4.00],
            ['zone_id' => $thessaloniki->id, 'method' => 'COURIER', 'price_eur' => 5.00],

            // Mainland - moderate
            ['zone_id' => $mainland->id, 'method' => 'HOME', 'price_eur' => 5.00],
            ['zone_id' => $mainland->id, 'method' => 'COURIER', 'price_eur' => 6.00],

            // Islands - highest
            ['zone_id' => $islands->id, 'method' => 'HOME', 'price_eur' => 7.00],
            ['zone_id' => $islands->id, 'method' => 'COURIER', 'price_eur' => 8.50],
        ];

        foreach ($rates as $rate) {
            ShippingRate::create([
                'zone_id' => $rate['zone_id'],
                'method' => $rate['method'],
                'weight_min_kg' => 0,
                'weight_max_kg' => 30.00,
                'price_eur' => $rate['price_eur'],
                'is_active' => true,
            ]);
        }
    }
}
