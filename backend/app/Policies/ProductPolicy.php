<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Determine whether the user can view the model.
     * Currently allows all access for read-only API.
     * TODO: Tighten later with proper authorization.
     */
    public function view(?User $user, Product $product): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view any models.
     * Currently allows all access for read-only API.
     * TODO: Tighten later with proper authorization.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }
}