<?php

namespace App\Services\Lockers;

interface LockerProvider
{
    /**
     * Search for lockers by postal code.
     *
     * @param string $postalCode
     * @return array
     */
    public function searchByPostalCode(string $postalCode): array;

    /**
     * Get a specific locker by ID.
     *
     * @param string $lockerId
     * @return array|null
     */
    public function getLocker(string $lockerId): ?array;

    /**
     * Check if the provider is available.
     *
     * @return bool
     */
    public function isAvailable(): bool;
}