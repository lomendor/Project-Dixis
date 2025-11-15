<?php

namespace App\Services;

use App\Models\FeeRule;
use App\Models\DixisSetting;
use Illuminate\Support\Carbon;

class FeeResolver
{
    /**
     * Resolve fee configuration for a given producer, category, and channel.
     *
     * Priority: Producer override > Category rule > Global default
     *
     * @param int|null $producerId
     * @param int|null $categoryId
     * @param string $channel 'b2c' or 'b2b'
     * @return array ['rate' => float, 'fee_vat_rate' => float, 'source' => string]
     */
    public function resolve(?int $producerId, ?int $categoryId, string $channel): array
    {
        $today = Carbon::today();

        // 1) Specific rules by priority & specificity
        $rule = FeeRule::query()
            ->where('is_active', true)
            ->where(function ($q) use ($today) {
                $q->whereNull('effective_to')->orWhere('effective_to', '>=', $today);
            })
            ->where('effective_from', '<=', $today)
            ->when($channel, fn($q) => $q->where(function ($sq) use ($channel) {
                $sq->whereNull('channel')->orWhere('channel', $channel);
            }))
            ->when($producerId, fn($q) => $q->where(function ($sq) use ($producerId) {
                $sq->whereNull('producer_id')->orWhere('producer_id', $producerId);
            }))
            ->when($categoryId, fn($q) => $q->where(function ($sq) use ($categoryId) {
                $sq->whereNull('category_id')->orWhere('category_id', $categoryId);
            }))
            ->orderByRaw('producer_id IS NULL')   // non-null first
            ->orderByRaw('category_id IS NULL')
            ->orderByRaw('channel IS NULL')
            ->orderBy('priority')
            ->orderByDesc('effective_from')
            ->first();

        if ($rule) {
            return [
                'rate' => (float)$rule->rate,
                'fee_vat_rate' => $rule->fee_vat_rate !== null
                    ? (float)$rule->fee_vat_rate
                    : $this->defaultVat(),
                'source' => 'fee_rules',
            ];
        }

        // 2) Global defaults from settings
        $b2c = $this->getSetting('fee.b2c.rate', null);
        $b2b = $this->getSetting('fee.b2b.rate', null);
        $vat = $this->defaultVat();

        $rate = $channel === 'b2b'
            ? ($b2b ?? config('dixis.fees.b2b', 0.07))
            : ($b2c ?? config('dixis.fees.b2c', 0.12));

        return [
            'rate' => (float)$rate,
            'fee_vat_rate' => (float)$vat,
            'source' => 'defaults',
        ];
    }

    /**
     * Get a setting value by key.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    protected function getSetting(string $key, $default = null)
    {
        $s = DixisSetting::where('key', $key)->first();
        return $s ? ($s->value['v'] ?? $default) : $default;
    }

    /**
     * Get the default VAT rate for fees.
     *
     * @return float
     */
    protected function defaultVat(): float
    {
        $s = DixisSetting::where('key', 'fee.vat.rate')->first();
        return (float)($s ? ($s->value['v'] ?? config('dixis.fees.fee_vat_rate', 0.24)) : config('dixis.fees.fee_vat_rate', 0.24));
    }
}
