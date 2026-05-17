<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Mahasiswa extends Model
{
    use HasUuids;

    protected $table = 'mahasiswa';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'nim', 'nama_lengkap', 'tempat_lahir', 'tanggal_lahir',
        'jenis_kelamin', 'prodi_id', 'tahun_masuk', 'tahun_lulus',
        'ipk', 'judul_skripsi', 'email', 'no_hp', 'foto', 'status', 'user_id'
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'ipk' => 'decimal:2'
    ];

    public function prodi(): BelongsTo
    {
        return $this->belongsTo(Prodi::class);
    }

    public function ijazah(): HasOne
    {
        return $this->hasOne(Ijazah::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getNamaLengkapWithGelarAttribute(): string
    {
        $gelar = $this->prodi ? match($this->prodi->jenjang) {
            'S1' => 'S.Kom',
            'S2' => 'M.Kom',
            'D3', 'D4' => 'A.Md.',
            default => ''
        } : '';
        return $gelar ? "{$this->nama_lengkap}, {$gelar}" : $this->nama_lengkap;
    }
}