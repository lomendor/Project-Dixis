<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine whether the user can view the model.
     * Currently allows all access for read-only API.
     * TODO: Tighten later with proper authorization.
     */
    public function view(?User $user, Order $order): bool
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