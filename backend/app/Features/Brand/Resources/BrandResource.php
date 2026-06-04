<?php

namespace App\Features\Brand\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = (bool) $request->user()?->is_admin;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'logo' => $this->logo,
            'description' => $this->description,
            'website' => $this->website,
            'is_active' => $this->is_active,
            'products_count' => $this->whenCounted('products'),
            'created_by' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'username' => $this->user->username,
            ] + ($isAdmin ? ['email' => $this->user->email] : []) : null),
            'updated_by' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy ? [
                'id' => $this->updatedBy->id,
                'username' => $this->updatedBy->username,
            ] + ($isAdmin ? ['email' => $this->updatedBy->email] : []) : null),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
