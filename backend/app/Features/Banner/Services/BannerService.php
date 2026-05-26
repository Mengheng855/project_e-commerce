<?php

namespace App\Features\Banner\Services;

use App\Models\Banner;
use Illuminate\Database\Eloquent\Collection;

class BannerService
{
    public function active(): Collection
    {
        return Banner::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->latest()
            ->get();
    }

    public function all(): Collection
    {
        return Banner::query()
            ->orderBy('sort_order')
            ->latest()
            ->get();
    }

    public function delete(Banner $banner): void
    {
        $banner->delete();
    }

    public function update(Banner $banner, array $data): Banner
    {
        $banner->fill($data);
        $banner->save();
        return $banner;
    }
}
