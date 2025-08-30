<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine whether the user can view the order.
     * Users can view their own orders, admins can view all.
     */
    public function view(?User $user, Order $order): bool
    {
        if (!$user) {
            return false; // Anonymous users cannot view orders
        }

        if ($user->role === 'admin') {
            return true;
        }

        // Users can view their own orders
        return $order->user_id === $user->id;
    }

    /**
     * Determine whether the user can view any orders.
     * Allow listing for demo purposes but will be filtered in controller.
     */
    public function viewAny(?User $user): bool
    {
        return true; // Public demo access - actual filtering happens in controller
    }

    /**
     * Determine whether the user can create orders.
     * Consumers, admins, and guests can create orders.
     * Producers cannot create orders (they sell, don't buy).
     */
    public function create(?User $user): bool
    {
        // Allow guest orders (user = null)
        if (!$user) {
            return true;
        }
        
        // Allow authenticated consumers and admins, but NOT producers
        return $user->role === 'consumer' || $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the order.
     * Only admins can update orders (status changes, etc.).
     */
    public function update(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete the order.
     * Only admins can delete orders.
     */
    public function delete(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }
}