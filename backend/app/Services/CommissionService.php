<?php

namespace App\Services;

use App\Models\CommissionRule;
use Illuminate\Support\Facades\DB;
use Laravel\Pennant\Feature;

class CommissionService
{
    /**
     * Resolve the most specific active commission rule for a given order-like payload.
     * Safe: returns null if flag is OFF or if nothing matches.
     *
     * @param  mixed  $order  (expects props: total_cents, channel, producer_id, optional: getCategoryIds() or category_ids[])
     * @return \App\Models\CommissionRule|null
     */
    public function resolveRuleFor($order): ?CommissionRule
    {
        if (!Feature::active('commission_engine_v1')) {
            return null;
        }

        $amount      = (int) data_get($order, 'total_cents', 0);
        $channel     = (string) data_get($order, 'channel', 'ALL');
        $producerId  = data_get($order, 'producer_id');
        $categoryIds = [];

        if (is_object($order) && method_exists($order, 'getCategoryIds')) {
            $maybe = $order->getCategoryIds();
            if (is_array($maybe)) $categoryIds = $maybe;
        } else {
            $maybe = data_get($order, 'category_ids', []);
            if (is_array($maybe)) $categoryIds = $maybe;
        }

        $q = CommissionRule::query()
            ->where('active', true)
            ->where('effective_from', '<=', now())
            ->where(function ($q) {
                $q->whereNull('effective_to')->orWhere('effective_to', '>=', now());
            })
            // Channel: exact channel or ALL
            ->where(function ($q) use ($channel) {
                $q->where('scope_channel', $channel)->orWhere('scope_channel', 'ALL');
            })
            // Producer match or global
            ->where(function ($q) use ($producerId) {
                $q->whereNull('scope_producer_id');
                if (!is_null($producerId)) {
                    $q->orWhere('scope_producer_id', $producerId);
                }
            })
            // Category match or global
            ->when(!empty($categoryIds), function ($q) use ($categoryIds) {
                $q->where(function ($qq) use ($categoryIds) {
                    $qq->whereNull('scope_category_id')
                       ->orWhereIn('scope_category_id', $categoryIds);
                });
            }, function ($q) {
                // no category context → allow null category rules
                $q->whereNull('scope_category_id');
            })
            // Tier window by order amount
            ->where('tier_min_amount_cents', '<=', $amount)
            ->where(function ($q) use ($amount) {
                $q->whereNull('tier_max_amount_cents')->orWhere('tier_max_amount_cents', '>=', $amount);
            })
            // Specificity & priority
            ->orderByDesc('priority')
            ->orderByRaw('(scope_producer_id IS NOT NULL) DESC')
            ->orderByRaw('(scope_category_id IS NOT NULL) DESC')
            ->orderByRaw("CASE scope_channel WHEN 'ALL' THEN 0 ELSE 1 END DESC");

        return $q->first();
    }

    /**
     * Calculate the commission for an order-like payload.
     * Returns structured array. Flag OFF → zero commission.
     *
     * @param  mixed  $order
     * @return array{commission_cents:int, rule_id:int|null, breakdown:mixed}
     */
    public function calculateFee($order): array
    {
        if (!Feature::active('commission_engine_v1')) {
            return [
                'commission_cents' => 0,
                'rule_id' => null,
                'breakdown' => 'Feature flag OFF',
            ];
        }

        $rule = $this->resolveRuleFor($order);
        if (!$rule) {
            return [
                'commission_cents' => 0,
                'rule_id' => null,
                'breakdown' => 'No applicable rule',
            ];
        }

        $amount = (int) data_get($order, 'total_cents', 0);
        $base = 0;

        if ((float)$rule->percent > 0) {
            $base += ($amount * (float)$rule->percent) / 100.0;
        }
        if (!is_null($rule->fixed_fee_cents)) {
            $base += (int) $rule->fixed_fee_cents;
        }

        $withVat = $this->applyVatMode($base, (string)$rule->vat_mode);
        $final = $this->applyRounding($withVat, (string)$rule->rounding_mode);

        return [
            'commission_cents' => (int) $final,
            'rule_id' => (int) $rule->id,
            'breakdown' => [
                'percent'   => (float) $rule->percent,
                'fixed_fee' => (int) ($rule->fixed_fee_cents ?? 0),
                'vat_mode'  => (string) $rule->vat_mode,
                'rounding'  => (string) $rule->rounding_mode,
            ],
        ];
    }

    private function applyVatMode(float $amount, string $vatMode): float
    {
        return match ($vatMode) {
            'INCLUDE' => $amount * 1.24, // 24% ΦΠΑ
            'EXCLUDE', 'NONE', '' => $amount,
            default => $amount,
        };
    }

    private function applyRounding(float $amount, string $roundingMode): float
    {
        return match ($roundingMode) {
            'UP'      => (float) ceil($amount),
            'DOWN'    => (float) floor($amount),
            'NEAREST' => (float) round($amount),
            default   => (float) round($amount),
        };
    }
}
