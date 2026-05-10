<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ijazah extends Model
{
    use HasUuids;

    protected $table = 'ijazah';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'mahasiswa_id', 'nomor_ijazah', 'hash_sha256', 'pdf_hash', 'qr_code_path',
        'file_path', 'blockchain_tx_hash', 'blockchain_block',
        'blockchain_timestamp', 'status', 'issued_by', 'issued_at', 'notes'
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'blockchain_timestamp' => 'datetime'
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function blockchainTransaction()
    {
        return $this->hasOne(BlockchainTransaction::class);
    }

    public function verificationLogs()
    {
        return $this->hasMany(VerificationLog::class);
    }

    public function getVerificationUrlAttribute(): string
    {
        return env('APP_FRONTEND_URL') . "/verify/{$this->hash_sha256}";
    }

    public function getBlockchainExplorerUrlAttribute(): string
    {
        return "https://sepolia.etherscan.io/tx/{$this->blockchain_tx_hash}";
    }
}