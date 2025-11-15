<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\Order;

class CommissionService
{
    public function __construct(
        private FeeResolver $fees = new FeeResolver()
    ) {}

    /**
     * Calculate and persist commission for an order.
     *
     * @param Order $order
     * @param string $channel 'b2c' or 'b2b'
     * @return Commission
     */
    public function settleForOrder(Order $order, string $channel = 'b2c'): Commission
    {
        // Get producer_id from order items (first item for simplicity)
        // In multi-producer orders, you'd loop per item or aggregate
        $producerId = $order->orderItems()->first()?->producer_id;
        $categoryId = null; // TODO: derive from items if product categories exist

        $resolved = $this->fees->resolve($producerId, $categoryId, $channel);

        // Use order total (supports both 'total' and legacy 'total_amount')
        $gross = (float)($order->total ?? $order->total_amount ?? 0);
        $platformFee = round($gross * (float)$resolved['rate'], 2);
        $platformFeeVat = round($platformFee * (float)$resolved['fee_vat_rate'], 2);
        $producerPayout = round($gross - $platformFee - $platformFeeVat, 2);

        return Commission::updateOrCreate(
            ['order_id' => $order->id, 'producer_id' => $producerId],
            [
                'channel' => $channel,
                'order_gross' => $gross,
                'platform_fee' => $platformFee,
                'platform_fee_vat' => $platformFeeVat,
                'producer_payout' => $producerPayout,
                'currency' => $order->currency ?? 'EUR',
            ]
        );
    }
}
