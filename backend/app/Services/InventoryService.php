<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Producer;
use App\Models\Notification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class InventoryService
{
    const LOW_STOCK_THRESHOLD = 5;

    /**
     * Check for low stock products and send alerts
     */
    public function checkLowStockAlerts(): void
    {
        $lowStockProducts = Product::where('stock', '<=', self::LOW_STOCK_THRESHOLD)
            ->where('stock', '>', 0)
            ->where('is_active', true)
            ->with('producer.user')
            ->get();

        foreach ($lowStockProducts as $product) {
            $this->sendLowStockAlert($product);
        }
    }

    /**
     * Check low stock for a specific product and send alert if needed
     */
    public function checkProductLowStock(Product $product): void
    {
        if ($product->stock <= self::LOW_STOCK_THRESHOLD && $product->stock > 0 && $product->is_active) {
            $this->sendLowStockAlert($product);
        }
    }

    /**
     * Send low stock alert for a product
     */
    private function sendLowStockAlert(Product $product): void
    {
        if (!$product->producer || !$product->producer->user) {
            return;
        }

        $producer = $product->producer;
        $user = $producer->user;

        // Create in-app notification
        $notification = Notification::create([
            'user_id' => $user->id,
            'title' => 'Low Stock Alert',
            'message' => "Your product '{$product->name}' is running low on stock. Only {$product->stock} units remaining.",
            'type' => 'low_stock',
            'data' => [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'current_stock' => $product->stock,
                'threshold' => self::LOW_STOCK_THRESHOLD
            ],
            'is_read' => false,
        ]);

        // Send email notification
        try {
            // For now, we'll just log the email that would be sent
            // In a real implementation, you'd create a Mail class and send it
            Log::info("Low stock email notification", [
                'to' => $user->email,
                'product_name' => $product->name,
                'stock' => $product->stock,
                'producer_name' => $producer->name
            ]);

            // Uncomment when email implementation is ready:
            // Mail::to($user->email)->send(new LowStockAlert($product, $producer));
        } catch (\Exception $e) {
            Log::error("Failed to send low stock email notification", [
                'user_id' => $user->id,
                'product_id' => $product->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get low stock products for a producer
     */
    public function getLowStockProducts(Producer $producer): \Illuminate\Database\Eloquent\Collection
    {
        return $producer->products()
            ->where('stock', '<=', self::LOW_STOCK_THRESHOLD)
            ->where('stock', '>', 0)
            ->where('is_active', true)
            ->orderBy('stock', 'asc')
            ->get();
    }

    /**
     * Get out of stock products for a producer
     */
    public function getOutOfStockProducts(Producer $producer): \Illuminate\Database\Eloquent\Collection
    {
        return $producer->products()
            ->where('stock', 0)
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Update product stock and check for low stock alerts
     */
    public function updateProductStock(Product $product, int $newStock): void
    {
        $oldStock = $product->stock;
        $product->stock = $newStock;
        $product->save();

        // Check if we need to send low stock alert
        if ($newStock <= self::LOW_STOCK_THRESHOLD && $oldStock > self::LOW_STOCK_THRESHOLD) {
            $this->sendLowStockAlert($product);
        }
    }
}