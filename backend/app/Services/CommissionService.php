<?php

namespace App\Services;

use App\Models\CommissionRule;
use Laravel\Pennant\Feature;

class CommissionService
{
    /** $itemCtx: (object){ channel, producer_id, category_ids:[], line_total_cents:int } */
    public function resolveRule(object $itemCtx): ?CommissionRule
    {
        if (!Feature::active('commission_engine_v1')) return null;

        return CommissionRule::active()
            ->forContext((object)[
                'channel' => $itemCtx->channel,
                'producer_id' => $itemCtx->producer_id ?? null,
                'category_ids' => $itemCtx->category_ids ?? [],
            ])
            ->where('tier_min_amount_cents','<=',$itemCtx->line_total_cents)
            ->where(function($q) use ($itemCtx){
                $q->whereNull('tier_max_amount_cents')
                  ->orWhere('tier_max_amount_cents','>=',$itemCtx->line_total_cents);
            })
            ->orderByDesc('priority')
            ->orderByDesc('scope_producer_id')
            ->orderByDesc('scope_category_id')
            ->orderByDesc('scope_channel')
            ->first();
    }

    public function calculate(object $itemCtx): array
    {
        if (!Feature::active('commission_engine_v1'))
            return ['cents'=>0,'rule_id'=>null,'meta'=>'flag_off'];

        $rule = $this->resolveRule($itemCtx);
        if (!$rule) return ['cents'=>0,'rule_id'=>null,'meta'=>'no_rule'];

        $base = 0;
        if ($rule->percent > 0) $base += ($itemCtx->line_total_cents * (float)$rule->percent) / 100.0;
        if (!is_null($rule->fixed_fee_cents)) $base += (int)$rule->fixed_fee_cents;

        $base = $this->applyVat($base, $rule->vat_mode);
        $base = $this->round($base, $rule->rounding_mode);

        return ['cents'=>(int)$base, 'rule_id'=>$rule->id, 'meta'=>[
            'percent'=>$rule->percent, 'fixed_fee_cents'=>$rule->fixed_fee_cents,
            'vat_mode'=>$rule->vat_mode,'rounding'=>$rule->rounding_mode
        ]];
    }

    private function applyVat(float $amt, string $mode): float {
        return match($mode){
            'INCLUDE' => $amt * 1.24, // TODO: pull from config/table in TAX-01
            default => $amt,
        };
    }
    private function round(float $amt, string $mode): float {
        return match($mode){
            'UP' => ceil($amt),
            'DOWN' => floor($amt),
            default => round($amt),
        };
    }
}
