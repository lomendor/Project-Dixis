<?php

namespace App\Policies;

use App\Models\Producer;
use App\Models\User;

class ProducerPolicy
{
    /**
     * Determine whether the user can view the model.
     * Currently allows all access for read-only API.
     * TODO: Tighten later with proper authorization.
     */
    public function view(?User $user, Producer $producer): bool
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