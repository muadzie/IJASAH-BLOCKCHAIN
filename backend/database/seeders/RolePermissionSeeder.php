<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['super_admin', 'admin_akademik', 'mahasiswa', 'verifikator'];
        foreach ($roles as $role) {
            Role::create(['name' => $role, 'guard_name' => 'web']);
        }

        $permissions = [
            'view-dashboard',
            'manage-mahasiswa',
            'manage-certificates',
            'publish-certificates',
            'revoke-certificates',
            'verify-certificates',
            'manage-users',
            'view-verification-logs',
            'view-system-info',
            'clear-cache',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'web']);
        }

        $superAdmin = Role::where('name', 'super_admin')->first();
        $superAdmin->givePermissionTo(Permission::all());

        $adminAkademik = Role::where('name', 'admin_akademik')->first();
        $adminAkademik->givePermissionTo([
            'view-dashboard',
            'manage-mahasiswa',
            'manage-certificates',
            'publish-certificates',
            'revoke-certificates',
            'verify-certificates',
            'view-verification-logs',
        ]);

        $verifikator = Role::where('name', 'verifikator')->first();
        $verifikator->givePermissionTo([
            'view-dashboard',
            'verify-certificates',
            'view-verification-logs',
        ]);

        $mahasiswaRole = Role::where('name', 'mahasiswa')->first();
        $mahasiswaRole->givePermissionTo([
            'verify-certificates',
        ]);
    }
}
