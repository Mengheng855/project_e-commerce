<?php

namespace App\Features\Logo\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LogoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'image' => $this->image,
            'title' => $this->title,
            'is_active' => $this->is_active,
            'created_by' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'username' => $this->user->username,
                'email' => $this->user->email,
            ] : null),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
