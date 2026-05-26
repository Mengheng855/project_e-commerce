<?php

namespace App\Features\Product\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'original_price' => $this->original_price,
            'stock' => $this->stock,
            'image' => $this->image,
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => [
                'id' => $image->id,
                'image' => $image->image,
                'alt_text' => $image->alt_text,
                'is_primary' => $image->is_primary,
                'order' => $image->order,
                'created_at' => $image->created_at?->toISOString(),
            ])),
            'specifications' => $this->whenLoaded('specifications', fn () => $this->specifications->map(fn ($specification) => [
                'id' => $specification->id,
                'key' => $specification->key,
                'value' => $specification->value,
                'order' => $specification->order,
            ])),
            'variants' => $this->whenLoaded('variants', fn () => $this->variants->map(fn ($variant) => [
                'id' => $variant->id,
                'variant_type_id' => $variant->variant_type_id,
                'variant_type' => $variant->relationLoaded('variantType') && $variant->variantType ? [
                    'id' => $variant->variantType->id,
                    'name' => $variant->variantType->name,
                ] : null,
                'value' => $variant->value,
                'color_hex' => $variant->color_hex,
                'price_modifier' => $variant->price_modifier,
                'stock' => $variant->stock,
                'is_active' => $variant->is_active,
            ])),
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'brand' => $this->whenLoaded('brand', fn () => $this->brand ? [
                'id' => $this->brand->id,
                'name' => $this->brand->name,
                'slug' => $this->brand->slug,
            ] : null),
            'created_by' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'username' => $this->user->username,
            ] : null),
            'updated_by' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy ? [
                'id' => $this->updatedBy->id,
                'username' => $this->updatedBy->username,
            ] : null),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
