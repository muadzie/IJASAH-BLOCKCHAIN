<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids, HasRoles;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'two_factor_secret', 'two_factor_recovery_codes',
    ];

    protected $hidden = [
        'password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function mahasiswa()
    {
        return $this->hasOne(Mahasiswa::class);
    }

    public function issuedCertificates()
    {
        return $this->hasMany(Ijazah::class, 'issued_by');
    }

    public function activities()
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function isSuperAdmin()
    {
        return $this->role === 'super_admin' || $this->hasRole('super_admin');
    }

    public function isAdminAkademik()
    {
        return $this->role === 'admin_akademik' || $this->hasRole('admin_akademik');
    }

    public function isMahasiswa()
    {
        return $this->role === 'mahasiswa' || $this->hasRole('mahasiswa');
    }
}