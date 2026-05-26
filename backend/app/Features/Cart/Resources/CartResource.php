<?php

namespace App\Features\Cart\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->items->map(function ($item) {
            $unitPrice = (float) $item->unit_price;
            $qty = (int) $item->qty;

            return [
                'id' => $item->id,
                'product' => $item->relationLoaded('product') && $item->product ? [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'image' => $item->product->image,
                    'price' => $item->product->price,
                    'stock' => $item->product->stock,
                ] : null,
                'selected_options' => $item->selected_options ?? [],
                'variant_label' => $item->variant_label,
                'qty' => $qty,
                'unit_price' => number_format($unitPrice, 2, '.', ''),
                'subtotal' => number_format($unitPrice * $qty, 2, '.', ''),
                'created_at' => $item->created_at?->toISOString(),
                'updated_at' => $item->updated_at?->toISOString(),
            ];
        });

        return [
            'id' => $this->id,
            'items' => $items,
            'items_count' => $items->sum('qty'),
            'total' => number_format($items->sum(fn ($item) => (float) $item['subtotal']), 2, '.', ''),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
