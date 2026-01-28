<?php

namespace App\Exceptions;

use Exception;

/**
 * Pass ORDER-SHIPPING-SPLIT-01: Exception for shipping cost mismatch
 *
 * Thrown when the locked shipping cost differs from the quoted shipping cost.
 * Frontend should show HARD_BLOCK modal for user to accept new amount.
 */
class ShippingChangedException extends Exception
{
    public float $quotedTotal;
    public float $lockedTotal;

    public function __construct(float $quotedTotal, float $lockedTotal)
    {
        $this->quotedTotal = $quotedTotal;
        $this->lockedTotal = $lockedTotal;

        parent::__construct(
            "Shipping cost changed from {$quotedTotal} to {$lockedTotal}",
            409
        );
    }

    public function toArray(): array
    {
        return [
            'code' => 'SHIPPING_CHANGED',
            'message' => $this->getMessage(),
            'quoted_total' => $this->quotedTotal,
            'locked_total' => $this->lockedTotal,
        ];
    }
}
