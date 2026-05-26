<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginSession extends Model
{
    protected $fillable = [
        'user_id',
        'personal_access_token_id',
        'device_name',
        'browser',
        'platform',
        'ip_address',
        'country',
        'city',
        'latitude',
        'longitude',
        'user_agent',
        'logged_in_at',
        'last_active_at',
        'logged_out_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'logged_in_at' => 'datetime',
            'last_active_at' => 'datetime',
            'logged_out_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
