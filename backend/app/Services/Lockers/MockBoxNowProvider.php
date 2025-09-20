<?php

namespace App\Services\Lockers;

class MockBoxNowProvider implements LockerProvider
{
    private array $lockers;

    public function __construct()
    {
        $fixturesPath = base_path('tests/Fixtures/lockers.json');
        $this->lockers = json_decode(file_get_contents($fixturesPath), true);
    }

    public function searchByPostalCode(string $postalCode): array
    {
        // Simple mock logic: return up to 5 lockers based on postal code prefix
        $prefix = substr($postalCode, 0, 2);
        $results = [];

        foreach ($this->lockers as $locker) {
            $lockerPrefix = substr($locker['postal_code'], 0, 2);

            // Match by postal code prefix (rough geographic matching)
            if ($lockerPrefix === $prefix) {
                $results[] = $locker;
            }
        }

        // If no exact matches, return some generic results (max 5)
        if (empty($results)) {
            $results = array_slice($this->lockers, 0, 3);
        }

        return array_slice($results, 0, 5);
    }

    public function getLocker(string $lockerId): ?array
    {
        foreach ($this->lockers as $locker) {
            if ($locker['id'] === $lockerId) {
                return $locker;
            }
        }

        return null;
    }

    public function isAvailable(): bool
    {
        return config('shipping.enable_lockers', false);
    }
}