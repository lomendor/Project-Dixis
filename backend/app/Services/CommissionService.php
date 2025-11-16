<?php

namespace App\Services;

use App\Models\Order;
use Laravel\Pennant\Feature;

class CommissionService
{
    /**
     * Calculate commission for an order.
     * Returns 0 if feature flag is OFF.
     * Future: will resolve rules from commission_rules table.
     *
     * @param Order $order
     * @return int Commission in cents
     */
    public function calculateFee(Order $order): int
    {
        // Feature flag check - returns zero if flag is OFF
        if (!Feature::active('commission_engine_v1')) {
            return 0;
        }

        // TODO (COMM-ENGINE-03): resolve rules from commission_rules table
        // For now, return zero even when flag is ON (skeleton phase)
        return 0;
    }

    /**
     * Get commission details breakdown.
     *
     * @param Order $order
     * @return array
     */
    public function getCommissionBreakdown(Order $order): array
    {
        $fee = $this->calculateFee($order);

        return [
            'total_cents' => $fee,
            'flag_active' => Feature::active('commission_engine_v1'),
            'applied_rules' => [], // TODO: populate in COMM-ENGINE-03
        ];
    }
}
