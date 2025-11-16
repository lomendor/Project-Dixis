<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TaxRateFactory extends Factory
{
    protected $model = \App\Models\TaxRate::class;

    public function definition(): array
    {
        return [
            'name' => 'VAT-24',
            'rate_percent' => 24.00,
            'is_default' => true,
            'valid_from' => now(),
            'valid_to' => null,
        ];
    }
}
