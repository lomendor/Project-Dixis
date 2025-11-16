<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class CommissionRule extends Model
{
    protected $fillable = [
        'scope_channel','scope_category_id','scope_producer_id',
        'percent','fixed_fee_cents','tier_min_amount_cents','tier_max_amount_cents',
        'vat_mode','rounding_mode','effective_from','effective_to','priority','active'
    ];

    protected $casts = [
        'effective_from' => 'datetime',
        'effective_to' => 'datetime',
        'active' => 'boolean',
        'percent' => 'decimal:2',
    ];

    public function scopeActive(Builder $q): Builder {
        return $q->where('active', true)
            ->where('effective_from','<=',now())
            ->where(function($qq){ $qq->whereNull('effective_to')->orWhere('effective_to','>=',now()); });
    }

    /** $ctx = (object){ channel, total_cents, producer_id, category_ids:[] } */
    public function scopeForContext(Builder $q, object $ctx): Builder {
        return $q->where(function($qq) use ($ctx){
                $qq->where('scope_channel',$ctx->channel)->orWhere('scope_channel','ALL');
            })
            ->where(function($qq) use ($ctx){
                $qq->whereNull('scope_producer_id')
                   ->orWhere('scope_producer_id',$ctx->producer_id ?? null);
            })
            ->where(function($qq) use ($ctx){
                $ids = $ctx->category_ids ?? [];
                if (empty($ids)) { $qq->whereNull('scope_category_id'); }
                else { $qq->whereNull('scope_category_id')->orWhereIn('scope_category_id',$ids); }
            });
    }
}
