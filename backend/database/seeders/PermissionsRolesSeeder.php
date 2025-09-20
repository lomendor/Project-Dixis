<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsRolesSeeder extends Seeder
{
    public function run(): void
    {
        // Guard
        $guard = 'web';

        // Create base permission if missing
        $perm = Permission::firstOrCreate(
            ['name' => 'manage.orders', 'guard_name' => $guard]
        );

        // Create admin role and sync permission
        $role = Role::firstOrCreate(
            ['name' => 'admin', 'guard_name' => $guard]
        );

        $role->givePermissionTo($perm);
    }
}