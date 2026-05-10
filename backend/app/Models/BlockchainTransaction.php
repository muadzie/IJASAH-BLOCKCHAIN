<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlockchainTransaction extends Model
{
    use HasUuids;

    protected $table = 'blockchain_transactions';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'ijazah_id', 'tx_hash', 'block_hash', 'block_number',
        'from_address', 'to_address', 'gas_used',
        'type', 'payload', 'status'
    ];

    protected $casts = [
        'payload' => 'json',
    ];

    public function ijazah(): BelongsTo
    {
        return $this->belongsTo(Ijazah::class);
    }
}
