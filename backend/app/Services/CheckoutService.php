<?php

namespace App\Services;

use App\Models\CheckoutSession;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderShippingLine;
use App\Models\Producer;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ShippingChangedException;

/**
 * Pass MP-ORDERS-SPLIT-01: Checkout Service
 * Pass SHIP-CALC-V2-01: Wire ShippingService for weight/zone-based calculation
 * Pass PRODUCER-THRESHOLD-POSTALCODE-01: Per-producer free shipping threshold
 *
 * Handles multi-producer order splitting. Creates a CheckoutSession parent
 * with N child Orders (one per producer) when cart has items from multiple producers.
 */
class CheckoutService
{
    private ShippingService $shippingService;

    public function __construct(ShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    /**
     * Get the free shipping threshold for a producer.
     * Pass PRODUCER-THRESHOLD-POSTALCODE-01: Per-producer threshold with fallback to config default.
     */
    private function getProducerThreshold(?Producer $producer): float
    {
        if ($producer && $producer->free_shipping_threshold_eur !== null) {
            return (float) $producer->free_shipping_threshold_eur;
        }
        return (float) config('shipping.default_free_shipping_threshold_eur', 35.00);
    }

    /**
     * Process checkout and create orders.
     *
     * For single-producer carts: Creates a standalone Order (backward compatible).
     * For multi-producer carts: Creates a CheckoutSession with N child Orders.
     *
     * Pass ORDER-SHIPPING-SPLIT-01: Added quoted_shipping parameter for mismatch detection.
     *
     * @param int|null $userId
     * @param array $productData Array of ['product' => Product, 'quantity' => int, 'unit_price' => float, 'total_price' => float]
     * @param array $options ['shipping_method', 'payment_method', 'currency', 'shipping_address', 'notes', 'quoted_shipping']
     * @return array ['checkout_session' => CheckoutSession|null, 'orders' => Order[]]
     * @throws ShippingChangedException If quoted shipping doesn't match locked shipping
     */
    public function processCheckout(?int $userId, array $productData, array $options): array
    {
        // Group items by producer
        $producerGroups = collect($productData)->groupBy(fn ($item) => $item['product']->producer_id ?? 0);
        $producerIds = $producerGroups->keys()->filter()->values();
        $isMultiProducer = $producerIds->count() > 1;

        $shippingMethod = $options['shipping_method'] ?? 'HOME';
        $isPickup = in_array(strtoupper($shippingMethod), ['PICKUP', 'STORE_PICKUP']);

        // Pass ORDER-SHIPPING-SPLIT-01: Calculate total locked shipping first for mismatch check
        $quotedShipping = $options['quoted_shipping'] ?? null;
        if ($quotedShipping !== null) {
            $lockedShipping = $this->calculateTotalShipping($producerGroups, $options, $isPickup);
            // Allow small rounding difference (1 cent)
            if (abs($quotedShipping - $lockedShipping) > 0.01) {
                throw new ShippingChangedException($quotedShipping, $lockedShipping);
            }
        }

        if ($isMultiProducer) {
            return $this->createMultiProducerCheckout($userId, $producerGroups, $options, $isPickup);
        }

        // Single producer: create standalone order (backward compatible)
        return $this->createSingleProducerOrder($userId, $productData, $producerGroups, $options, $isPickup);
    }

    /**
     * Calculate total shipping across all producers (for mismatch check).
     * Pass ORDER-SHIPPING-SPLIT-01
     */
    private function calculateTotalShipping($producerGroups, array $options, bool $isPickup): float
    {
        $totalShipping = 0.0;

        foreach ($producerGroups as $producerId => $items) {
            if (!$producerId) {
                continue;
            }

            $producer = Producer::find($producerId);
            $producerSubtotal = collect($items)->sum('total_price');
            $itemsArray = collect($items)->toArray();
            $shippingCost = $this->calculateProducerShipping($itemsArray, $producerSubtotal, $options, $isPickup, $producer);
            $totalShipping += $shippingCost;
        }

        return $totalShipping;
    }

    /**
     * Create a multi-producer checkout with N child orders.
     */
    private function createMultiProducerCheckout(?int $userId, $producerGroups, array $options, bool $isPickup): array
    {
        $shippingMethod = $options['shipping_method'] ?? 'HOME';
        $paymentMethod = $options['payment_method'] ?? 'COD';
        $currency = $options['currency'] ?? 'EUR';

        $orders = [];
        $sessionSubtotal = 0;
        $sessionShippingTotal = 0;
        $sessionTotal = 0;

        // Pass COD-FEE-FIX-01: Calculate COD fee once for the whole checkout
        $codFee = $this->calculateCodFee($paymentMethod);
        $codFeeApplied = false; // Track so we only add it to the first child order

        // Create CheckoutSession first
        $checkoutSession = CheckoutSession::create([
            'user_id' => $userId,
            'status' => CheckoutSession::STATUS_PENDING,
            'currency' => $currency,
            'subtotal' => 0,
            'shipping_total' => 0,
            'total' => 0,
            'order_count' => 0,
        ]);

        // Create one order per producer
        foreach ($producerGroups as $producerId => $items) {
            if (!$producerId) {
                continue; // Skip items without producer
            }

            // Calculate producer subtotal
            $producerSubtotal = collect($items)->sum('total_price');

            // Get producer info
            $producer = Producer::find($producerId);
            $producerName = $producer?->name ?? 'Unknown Producer';

            // Calculate shipping for this producer using ShippingService
            // Pass ORDER-SHIPPING-SPLIT-01: Get full shipping details for lock fields
            // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Per-producer threshold
            $itemsArray = collect($items)->toArray();
            $shippingDetails = $this->calculateProducerShippingWithDetails($itemsArray, $producerSubtotal, $options, $isPickup, $producer);
            $shippingCost = $shippingDetails['cost'];
            $freeShippingApplied = $shippingCost === 0.0;

            // Pass COD-FEE-FIX-01: Apply COD fee to first child order only
            $orderCodFee = (!$codFeeApplied && $codFee > 0) ? $codFee : 0;
            if ($orderCodFee > 0) {
                $codFeeApplied = true;
            }
            $orderTotal = $producerSubtotal + $shippingCost + $orderCodFee;

            // Create child order
            $order = Order::create([
                'user_id' => $userId,
                'checkout_session_id' => $checkoutSession->id,
                'is_child_order' => true,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $paymentMethod,
                'shipping_method' => $shippingMethod,
                'shipping_address' => $options['shipping_address'] ?? null,
                'currency' => $currency,
                'subtotal' => $producerSubtotal,
                'shipping_cost' => $shippingCost,
                'cod_fee' => $orderCodFee,
                'total' => $orderTotal,
                'total_amount' => $orderTotal, // Legacy alias
                'notes' => $options['notes'] ?? null,
            ]);

            // Create order items for this producer
            foreach ($items as $data) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $data['product']->id,
                    'producer_id' => $data['product']->producer_id,
                    'quantity' => $data['quantity'],
                    'unit_price' => $data['unit_price'],
                    'total_price' => $data['total_price'],
                    'product_name' => $data['product']->name,
                    'product_unit' => $data['product']->unit,
                ]);
            }

            // Create shipping line for this order
            // Pass ORDER-SHIPPING-SPLIT-01: Include zone, weight, quoted_at, locked_at
            OrderShippingLine::create([
                'order_id' => $order->id,
                'producer_id' => $producerId,
                'producer_name' => $producerName,
                'subtotal' => $producerSubtotal,
                'shipping_cost' => $shippingCost,
                'shipping_method' => $shippingMethod,
                'zone' => $shippingDetails['zone'],
                'weight_grams' => $shippingDetails['weight_grams'],
                'free_shipping_applied' => $freeShippingApplied,
                'quoted_at' => $options['quoted_at'] ?? null,
                'locked_at' => now(),
            ]);

            // Accumulate session totals
            $sessionSubtotal += $producerSubtotal;
            $sessionShippingTotal += $shippingCost;
            $sessionTotal += $orderTotal;

            $orders[] = $order;
        }

        // Update CheckoutSession with totals
        $checkoutSession->update([
            'subtotal' => $sessionSubtotal,
            'shipping_total' => $sessionShippingTotal,
            'total' => $sessionTotal,
            'order_count' => count($orders),
        ]);

        // Pass PROD-CHECKOUT-SAFETY-01: Load relationships on checkout session
        // Use nested eager loading to ensure shippingLines is available when CheckoutSessionResource
        // aggregates them at the top level
        $checkoutSession->load(['orders.orderItems.producer', 'orders.shippingLines']);

        // Also update the $orders array for email sending (needs shippingLines)
        foreach ($orders as $order) {
            $order->load('shippingLines')->loadCount('orderItems');
        }

        return [
            'checkout_session' => $checkoutSession,
            'orders' => $orders,
        ];
    }

    /**
     * Create a single-producer order (backward compatible).
     */
    private function createSingleProducerOrder(?int $userId, array $productData, $producerGroups, array $options, bool $isPickup): array
    {
        $shippingMethod = $options['shipping_method'] ?? 'HOME';
        $paymentMethod = $options['payment_method'] ?? 'COD';
        $currency = $options['currency'] ?? 'EUR';

        $orderTotal = collect($productData)->sum('total_price');
        $shippingLines = [];
        $totalShippingCost = 0;

        // Calculate shipping per producer (even for single producer)
        foreach ($producerGroups as $producerId => $items) {
            if (!$producerId) {
                continue;
            }

            $producerSubtotal = collect($items)->sum('total_price');
            $producer = Producer::find($producerId);
            $producerName = $producer?->name ?? 'Unknown Producer';

            // Calculate shipping using ShippingService
            // Pass ORDER-SHIPPING-SPLIT-01: Get full shipping details for lock fields
            // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Per-producer threshold
            $itemsArray = collect($items)->toArray();
            $shippingDetails = $this->calculateProducerShippingWithDetails($itemsArray, $producerSubtotal, $options, $isPickup, $producer);
            $shippingCost = $shippingDetails['cost'];
            $freeShippingApplied = $shippingCost === 0.0;

            $totalShippingCost += $shippingCost;

            $shippingLines[] = [
                'producer_id' => $producerId,
                'producer_name' => $producerName,
                'subtotal' => $producerSubtotal,
                'shipping_cost' => $shippingCost,
                'shipping_method' => $shippingMethod,
                'zone' => $shippingDetails['zone'],
                'weight_grams' => $shippingDetails['weight_grams'],
                'free_shipping_applied' => $freeShippingApplied,
            ];
        }

        // Pass COD-FEE-FIX-01: Calculate COD fee server-side
        $codFee = $this->calculateCodFee($paymentMethod);
        $totalWithShipping = $orderTotal + $totalShippingCost + $codFee;

        // Create standalone order (no checkout_session_id)
        $order = Order::create([
            'user_id' => $userId,
            'checkout_session_id' => null,
            'is_child_order' => false,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => $paymentMethod,
            'shipping_method' => $shippingMethod,
            'shipping_address' => $options['shipping_address'] ?? null,
            'currency' => $currency,
            'subtotal' => $orderTotal,
            'shipping_cost' => $totalShippingCost,
            'cod_fee' => $codFee,
            'total' => $totalWithShipping,
            'total_amount' => $totalWithShipping, // Legacy alias
            'notes' => $options['notes'] ?? null,
        ]);

        // Create order items
        foreach ($productData as $data) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $data['product']->id,
                'producer_id' => $data['product']->producer_id,
                'quantity' => $data['quantity'],
                'unit_price' => $data['unit_price'],
                'total_price' => $data['total_price'],
                'product_name' => $data['product']->name,
                'product_unit' => $data['product']->unit,
            ]);
        }

        // Create shipping lines
        // Pass ORDER-SHIPPING-SPLIT-01: Include zone, weight, quoted_at, locked_at
        foreach ($shippingLines as $line) {
            OrderShippingLine::create([
                'order_id' => $order->id,
                'producer_id' => $line['producer_id'],
                'producer_name' => $line['producer_name'],
                'subtotal' => $line['subtotal'],
                'shipping_cost' => $line['shipping_cost'],
                'shipping_method' => $line['shipping_method'],
                'zone' => $line['zone'],
                'weight_grams' => $line['weight_grams'],
                'free_shipping_applied' => $line['free_shipping_applied'],
                'quoted_at' => $options['quoted_at'] ?? null,
                'locked_at' => now(),
            ]);
        }

        $order->load(['orderItems.producer', 'shippingLines'])->loadCount('orderItems');

        return [
            'checkout_session' => null,
            'orders' => [$order],
        ];
    }

    /**
     * Calculate shipping cost for a producer using ShippingService.
     *
     * Pass SHIP-CALC-V2-01: Use weight/zone-based calculation.
     * Pass PRODUCER-THRESHOLD-POSTALCODE-01: Per-producer threshold support.
     */
    private function calculateProducerShipping(array $items, float $subtotal, array $options, bool $isPickup, ?Producer $producer = null): float
    {
        if ($isPickup) {
            return 0.0;
        }

        // Free shipping if above threshold (per-producer)
        $threshold = $this->getProducerThreshold($producer);
        if ($subtotal >= $threshold) {
            return 0.0;
        }

        // Calculate total weight from items (default 0.5kg per item)
        $totalWeightKg = 0.0;
        foreach ($items as $item) {
            $product = $item['product'];
            $qty = $item['quantity'] ?? 1;
            $weightPerUnit = $product->weight_per_unit ?? 0.5; // Default 0.5kg
            $totalWeightKg += $weightPerUnit * $qty;
        }

        // Get postal code from shipping address
        $shippingAddress = $options['shipping_address'] ?? [];
        $postalCode = $shippingAddress['postal_code'] ?? $shippingAddress['postalCode'] ?? '10551';

        // Get zone from postal code
        $zoneCode = $this->shippingService->getZoneByPostalCode($postalCode);

        // Calculate shipping using ShippingService
        $result = $this->shippingService->calculateShippingCost($totalWeightKg, $zoneCode);

        return $result['cost_eur'];
    }

    /**
     * Calculate shipping cost with full details for lock fields.
     * Pass ORDER-SHIPPING-SPLIT-01: Returns zone, weight_grams alongside cost.
     * Pass PRODUCER-THRESHOLD-POSTALCODE-01: Per-producer threshold support.
     *
     * @return array{cost: float, zone: string|null, weight_grams: int, threshold_eur: float}
     */
    private function calculateProducerShippingWithDetails(array $items, float $subtotal, array $options, bool $isPickup, ?Producer $producer = null): array
    {
        // Calculate total weight from items (default 0.5kg per item)
        $totalWeightKg = 0.0;
        foreach ($items as $item) {
            $product = $item['product'];
            $qty = $item['quantity'] ?? 1;
            $weightPerUnit = $product->weight_per_unit ?? 0.5; // Default 0.5kg
            $totalWeightKg += $weightPerUnit * $qty;
        }
        $weightGrams = (int) round($totalWeightKg * 1000);

        // Get postal code from shipping address
        $shippingAddress = $options['shipping_address'] ?? [];
        $postalCode = $shippingAddress['postal_code'] ?? $shippingAddress['postalCode'] ?? '10551';

        // Get zone from postal code
        $zoneCode = $this->shippingService->getZoneByPostalCode($postalCode);

        // Get producer-specific threshold
        $threshold = $this->getProducerThreshold($producer);

        if ($isPickup) {
            return [
                'cost' => 0.0,
                'zone' => 'PICKUP',
                'weight_grams' => $weightGrams,
                'threshold_eur' => $threshold,
            ];
        }

        // Free shipping if above threshold (per-producer)
        if ($subtotal >= $threshold) {
            return [
                'cost' => 0.0,
                'zone' => $zoneCode,
                'weight_grams' => $weightGrams,
                'threshold_eur' => $threshold,
            ];
        }

        // Calculate shipping using ShippingService
        $result = $this->shippingService->calculateShippingCost($totalWeightKg, $zoneCode);

        return [
            'cost' => $result['cost_eur'],
            'zone' => $zoneCode,
            'weight_grams' => $weightGrams,
            'threshold_eur' => $threshold,
        ];
    }

    /**
     * Calculate COD fee based on payment method and config.
     * Pass COD-FEE-FIX-01: Server-side COD fee calculation.
     *
     * @param string $paymentMethod
     * @return float COD fee in EUR (0.0 if not applicable)
     */
    private function calculateCodFee(string $paymentMethod): float
    {
        if (strtoupper($paymentMethod) !== 'COD') {
            return 0.0;
        }

        if (!config('shipping.enable_cod', false)) {
            return 0.0;
        }

        return (float) config('shipping.cod_fee_eur', 4.00);
    }
}
