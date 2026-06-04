<?php

namespace App\Features\Banner\Resources;

use App\Support\PublicUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BannerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'image' => PublicUrl::normalize($this->image),
            'foreground_image' => PublicUrl::normalize($this->foreground_image),
            'title' => $this->title,
            'text' => $this->text,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
