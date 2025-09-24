<?php

namespace App\Services;

use App\Models\User;
use App\Models\Producer;
use App\Models\Product;
use App\Models\Address;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class TestSeedService
{
    private const SEED_PREFIX = 'test_seed_';
    private const SEED_MARKER = 'e2e_shipping_test';

    /**
     * Create minimal shipping test data
     */
    public function seedShippingData(): array
    {
        $createdIds = [
            'users' => [],
            'producers' => [],
            'products' => [],
            'addresses' => [],
        ];

        // 1. Create test producer user
        $producerUser = User::create([
            'name' => self::SEED_PREFIX . 'producer',
            'email' => self::SEED_PREFIX . 'producer@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'role' => 'producer',
        ]);

        // Assign producer role if using Spatie permissions
        if (class_exists(Role::class)) {
            $producerRole = Role::firstOrCreate(['name' => 'producer']);
            $producerUser->assignRole($producerRole);
        }

        $createdIds['users'][] = $producerUser->id;
        Log::info("🌱 Created producer user: {$producerUser->id}");

        // 2. Create producer profile
        $producer = Producer::create([
            'name' => self::SEED_PREFIX . 'producer',
            'slug' => self::SEED_PREFIX . 'producer-' . Str::random(6),
            'business_name' => 'Test Producer Business',
            'description' => 'Test producer for E2E shipping tests',
            'location' => 'Athens, Greece',
            'address' => 'Test Street 123',
            'city' => 'Athens',
            'postal_code' => '10435',
            'region' => 'Attica',
            'phone' => '+30 210 1234567',
            'email' => self::SEED_PREFIX . 'producer@example.com',
            'verified' => true,
            'status' => 'active',
            'is_active' => true,
            'user_id' => $producerUser->id,
        ]);

        $createdIds['producers'][] = $producer->id;
        Log::info("🌱 Created producer: {$producer->id}");

        // 3. Create test consumer user (for checkout)
        $consumerUser = User::create([
            'name' => self::SEED_PREFIX . 'consumer',
            'email' => self::SEED_PREFIX . 'consumer@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'role' => 'consumer',
        ]);

        // Assign consumer role if using Spatie permissions
        if (class_exists(Role::class)) {
            $consumerRole = Role::firstOrCreate(['name' => 'consumer']);
            $consumerUser->assignRole($consumerRole);
        }

        $createdIds['users'][] = $consumerUser->id;
        Log::info("🌱 Created consumer user: {$consumerUser->id}");

        // 4. Create consumer address for shipping
        $address = Address::create([
            'user_id' => $consumerUser->id,
            'type' => 'shipping',
            'name' => 'Test Consumer',
            'line1' => 'Test Address 456',
            'city' => 'Athens',
            'postal_code' => '11527',
            'country' => 'GR',
            'phone' => '+30 210 7654321',
        ]);

        $createdIds['addresses'][] = $address->id;
        Log::info("🌱 Created address: {$address->id}");

        // 5. Create shippable products
        $products = [
            [
                'name' => self::SEED_PREFIX . 'organic_tomatoes',
                'slug' => self::SEED_PREFIX . 'organic-tomatoes-' . Str::random(6),
                'description' => 'Fresh organic tomatoes perfect for E2E shipping tests',
                'price' => 4.50,
                'weight_per_unit' => 1000, // 1kg in grams
                'unit' => 'kg',
                'stock' => 100,
                'category' => 'vegetables',
                'is_organic' => true,
                'is_seasonal' => false,
                'status' => 'available',
                'is_active' => true,
                'producer_id' => $producer->id,
            ],
            [
                'name' => self::SEED_PREFIX . 'olive_oil',
                'slug' => self::SEED_PREFIX . 'olive-oil-' . Str::random(6),
                'description' => 'Premium olive oil for E2E testing',
                'price' => 12.00,
                'weight_per_unit' => 500, // 500ml bottle
                'unit' => 'bottle',
                'stock' => 50,
                'category' => 'oils',
                'is_organic' => true,
                'is_seasonal' => false,
                'status' => 'available',
                'is_active' => true,
                'producer_id' => $producer->id,
            ],
            [
                'name' => self::SEED_PREFIX . 'honey',
                'slug' => self::SEED_PREFIX . 'honey-' . Str::random(6),
                'description' => 'Natural honey for shipping integration tests',
                'price' => 8.75,
                'weight_per_unit' => 400, // 400g jar
                'unit' => 'jar',
                'stock' => 25,
                'category' => 'dairy',
                'is_organic' => false,
                'is_seasonal' => false,
                'status' => 'available',
                'is_active' => true,
                'producer_id' => $producer->id,
            ],
        ];

        foreach ($products as $productData) {
            $product = Product::create($productData);
            $createdIds['products'][] = $product->id;
            Log::info("🌱 Created product: {$product->id} - {$product->name}");
        }

        // Store metadata for cleanup tracking
        $this->storeTestSeedMetadata($createdIds);

        return [
            'seed_id' => self::SEED_MARKER,
            'timestamp' => now()->toISOString(),
            'created' => $createdIds,
            'primary_product_id' => $createdIds['products'][0] ?? null,
            'consumer_user_id' => $consumerUser->id,
            'producer_id' => $producer->id,
            'message' => 'Shipping test data seeded successfully',
        ];
    }

    /**
     * Clean up all test seeded data
     */
    public function resetTestData(): array
    {
        $metadata = $this->getTestSeedMetadata();
        $deletedCounts = [
            'users' => 0,
            'producers' => 0,
            'products' => 0,
            'addresses' => 0,
        ];

        if (empty($metadata)) {
            Log::info("🧹 No test seed metadata found - performing fallback cleanup");
            return $this->performFallbackCleanup();
        }

        try {
            // Delete in reverse order of creation to respect foreign keys

            // 1. Delete products first (they reference producers)
            if (!empty($metadata['products'])) {
                $deletedCounts['products'] = Product::whereIn('id', $metadata['products'])->delete();
                Log::info("🧹 Deleted {$deletedCounts['products']} test products");
            }

            // 2. Delete addresses
            if (!empty($metadata['addresses'])) {
                $deletedCounts['addresses'] = Address::whereIn('id', $metadata['addresses'])->delete();
                Log::info("🧹 Deleted {$deletedCounts['addresses']} test addresses");
            }

            // 3. Delete producers
            if (!empty($metadata['producers'])) {
                $deletedCounts['producers'] = Producer::whereIn('id', $metadata['producers'])->delete();
                Log::info("🧹 Deleted {$deletedCounts['producers']} test producers");
            }

            // 4. Delete users last
            if (!empty($metadata['users'])) {
                $deletedCounts['users'] = User::whereIn('id', $metadata['users'])->delete();
                Log::info("🧹 Deleted {$deletedCounts['users']} test users");
            }

            // Clear metadata
            $this->clearTestSeedMetadata();

            return [
                'seed_id' => self::SEED_MARKER,
                'timestamp' => now()->toISOString(),
                'deleted' => $deletedCounts,
                'message' => 'Test data cleanup completed successfully',
            ];

        } catch (\Exception $e) {
            Log::error("🧹 Test data cleanup failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Get current test seed status
     */
    public function getTestSeedStatus(): array
    {
        $metadata = $this->getTestSeedMetadata();

        if (empty($metadata)) {
            return [
                'seeded' => false,
                'message' => 'No test seed data found',
            ];
        }

        // Check if seeded data still exists
        $existing = [
            'users' => User::whereIn('id', $metadata['users'] ?? [])->count(),
            'producers' => Producer::whereIn('id', $metadata['producers'] ?? [])->count(),
            'products' => Product::whereIn('id', $metadata['products'] ?? [])->count(),
            'addresses' => Address::whereIn('id', $metadata['addresses'] ?? [])->count(),
        ];

        return [
            'seeded' => true,
            'metadata' => $metadata,
            'existing_counts' => $existing,
            'message' => 'Test seed data status retrieved',
        ];
    }

    /**
     * Store metadata for tracking what was created
     */
    private function storeTestSeedMetadata(array $createdIds): void
    {
        $metadata = [
            'seed_id' => self::SEED_MARKER,
            'timestamp' => now()->toISOString(),
            'created' => $createdIds,
        ];

        // Store in cache or temporary file
        cache()->put('test_seed_metadata', $metadata, now()->addHours(2));

        Log::info("🌱 Stored test seed metadata", $metadata);
    }

    /**
     * Get stored metadata
     */
    private function getTestSeedMetadata(): ?array
    {
        return cache()->get('test_seed_metadata');
    }

    /**
     * Clear stored metadata
     */
    private function clearTestSeedMetadata(): void
    {
        cache()->forget('test_seed_metadata');
        Log::info("🧹 Cleared test seed metadata");
    }

    /**
     * Fallback cleanup using name prefixes (if metadata is lost)
     */
    private function performFallbackCleanup(): array
    {
        $deletedCounts = [
            'users' => User::where('name', 'LIKE', self::SEED_PREFIX . '%')
                           ->orWhere('email', 'LIKE', self::SEED_PREFIX . '%')
                           ->delete(),
            'producers' => Producer::where('name', 'LIKE', self::SEED_PREFIX . '%')
                                  ->orWhere('slug', 'LIKE', self::SEED_PREFIX . '%')
                                  ->delete(),
            'products' => Product::where('name', 'LIKE', self::SEED_PREFIX . '%')
                                 ->orWhere('slug', 'LIKE', self::SEED_PREFIX . '%')
                                 ->delete(),
            'addresses' => 0, // Addresses don't have name field, skip fallback
        ];

        Log::info("🧹 Fallback cleanup completed", $deletedCounts);

        return [
            'seed_id' => self::SEED_MARKER,
            'timestamp' => now()->toISOString(),
            'deleted' => $deletedCounts,
            'method' => 'fallback',
            'message' => 'Fallback test data cleanup completed',
        ];
    }
}