<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'variant_label',
        'selected_options',
        'qty',
        'price',
        'delivery_address',
        'delivery_lat',
        'delivery_lng',
    ];

    protected function casts(): array
    {
        return [
            'selected_options' => 'array',
            'qty' => 'integer',
            'price' => 'decimal:2',
            'delivery_lat' => 'decimal:15',
            'delivery_lng' => 'decimal:15',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
