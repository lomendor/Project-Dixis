<?php

namespace App\Services;

use App\Models\TaxRate;

class TaxService
{
    public function getDefaultRatePercent(): float
    {
        $rate = TaxRate::query()
            ->where('is_default', true)
            ->orderByDesc('valid_from')
            ->value('rate_percent');

        return $rate !== null ? (float)$rate : 24.00; // fallback ασφαλείας
    }

    public function applyVat(float $amount, string $vatMode = 'EXCLUDE'): float
    {
        if ($vatMode !== 'INCLUDE') {
            return $amount;
        }
        $rate = $this->getDefaultRatePercent();
        $multiplier = 1 + ($rate / 100.0);
        // Στρογγύλεμα σε cents (integer) όταν χρειαστεί downstream
        return $amount * $multiplier;
    }
}
