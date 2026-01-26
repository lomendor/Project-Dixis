<?php

namespace App\Services;

use App\Models\CheckoutSession;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderShippingLine;
use App\Models\Producer;
use Illuminate\Support\Facades\DB;

/**
 * Pass MP-ORDERS-SPLIT-01: Checkout Service
 *
 * Handles multi-producer order splitting. Creates a CheckoutSession parent
 * with N child Orders (one per producer) when cart has items from multiple producers.
 */
class CheckoutService
{
    // V1 Shipping calculation constants
    private const FREE_SHIPPING_THRESHOLD = 35.00; // €35 per producer
    private const FLAT_SHIPPING_RATE = 3.50; // €3.50 per producer shipment

    /**
     * Process checkout and create orders.
     *
     * For single-producer carts: Creates a standalone Order (backward compatible).
     * For multi-producer carts: Creates a CheckoutSession with N child Orders.
     *
     * @param int|null $userId
     * @param array $productData Array of ['product' => Product, 'quantity' => int, 'unit_price' => float, 'total_price' => float]
     * @param array $options ['shipping_method', 'payment_method', 'currency', 'shipping_address', 'notes']
     * @return array ['checkout_session' => CheckoutSession|null, 'orders' => Order[]]
     */
    public function processCheckout(?int $userId, array $productData, array $options): array
    {
        // Group items by producer
        $producerGroups = collect($productData)->groupBy(fn ($item) => $item['product']->producer_id ?? 0);
        $producerIds = $producerGroups->keys()->filter()->values();
        $isMultiProducer = $producerIds->count() > 1;

        $shippingMethod = $options['shipping_method'] ?? 'HOME';
        $isPickup = in_array(strtoupper($shippingMethod), ['PICKUP', 'STORE_PICKUP']);

        if ($isMultiProducer) {
            return $this->createMultiProducerCheckout($userId, $producerGroups, $options, $isPickup);
        }

        // Single producer: create standalone order (backward compatible)
        return $this->createSingleProducerOrder($userId, $productData, $producerGroups, $options, $isPickup);
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

            // Calculate shipping for this producer
            $shippingCost = $this->calculateProducerShipping($producerSubtotal, $isPickup);
            $freeShippingApplied = $shippingCost === 0.0;

            $orderTotal = $producerSubtotal + $shippingCost;

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
            OrderShippingLine::create([
                'order_id' => $order->id,
                'producer_id' => $producerId,
                'producer_name' => $producerName,
                'subtotal' => $producerSubtotal,
                'shipping_cost' => $shippingCost,
                'shipping_method' => $shippingMethod,
                'free_shipping_applied' => $freeShippingApplied,
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

            $shippingCost = $this->calculateProducerShipping($producerSubtotal, $isPickup);
            $freeShippingApplied = $shippingCost === 0.0;

            $totalShippingCost += $shippingCost;

            $shippingLines[] = [
                'producer_id' => $producerId,
                'producer_name' => $producerName,
                'subtotal' => $producerSubtotal,
                'shipping_cost' => $shippingCost,
                'shipping_method' => $shippingMethod,
                'free_shipping_applied' => $freeShippingApplied,
            ];
        }

        $totalWithShipping = $orderTotal + $totalShippingCost;

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
        foreach ($shippingLines as $line) {
            OrderShippingLine::create([
                'order_id' => $order->id,
                'producer_id' => $line['producer_id'],
                'producer_name' => $line['producer_name'],
                'subtotal' => $line['subtotal'],
                'shipping_cost' => $line['shipping_cost'],
                'shipping_method' => $line['shipping_method'],
                'free_shipping_applied' => $line['free_shipping_applied'],
            ]);
        }

        $order->load(['orderItems.producer', 'shippingLines'])->loadCount('orderItems');

        return [
            'checkout_session' => null,
            'orders' => [$order],
        ];
    }

    /**
     * Calculate shipping cost for a producer based on subtotal.
     */
    private function calculateProducerShipping(float $subtotal, bool $isPickup): float
    {
        if ($isPickup) {
            return 0.0;
        }

        if ($subtotal >= self::FREE_SHIPPING_THRESHOLD) {
            return 0.0;
        }

        return self::FLAT_SHIPPING_RATE;
    }
}
