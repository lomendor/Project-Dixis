<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Determine whether the user can view the model.
     * Public read access allowed for all.
     */
    public function view(?User $user, Product $product): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view any models.
     * Public read access allowed for all.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create products.
     */
    public function create(User $user): bool
    {
        return $user->role === 'producer' || $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the product.
     * Producers can only update their own products.
     */
    public function update(User $user, Product $product): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'producer') {
            // Check if the user owns this product through their producer record
            return $user->producer && $product->producer_id === $user->producer->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the product.
     * Same rules as update.
     */
    public function delete(User $user, Product $product): bool
    {
        return $this->update($user, $product);
    }
}