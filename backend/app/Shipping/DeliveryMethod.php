<?php

namespace App\Shipping;

enum DeliveryMethod: string
{
    case HOME = 'HOME';
    case LOCKER = 'LOCKER';

    public function getDisplayName(): string
    {
        return match($this) {
            self::HOME => 'Παράδοση στο σπίτι',
            self::LOCKER => 'Παράδοση σε Locker',
        };
    }

    public function requiresAddress(): bool
    {
        return match($this) {
            self::HOME => true,
            self::LOCKER => false,
        };
    }

    public function supportsDiscount(): bool
    {
        return match($this) {
            self::HOME => false,
            self::LOCKER => true,
        };
    }
}