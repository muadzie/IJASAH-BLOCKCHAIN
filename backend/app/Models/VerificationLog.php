<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificationLog extends Model
{
    use HasUuids;

    protected $table = 'verification_logs';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'ijazah_id', 'certificate_hash', 'verification_method',
        'ip_address', 'user_agent', 'verification_result', 'is_valid'
    ];

    protected $casts = [
        'verification_result' => 'json',
        'is_valid' => 'boolean',
    ];

    public function ijazah(): BelongsTo
    {
        return $this->belongsTo(Ijazah::class);
    }
}
