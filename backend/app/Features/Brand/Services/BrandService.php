<?php

namespace App\Features\Brand\Services;

use App\Models\Brand;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class BrandService
{
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 10), 50));

        return Brand::query()
            ->with(['user:id,username,email', 'updatedBy:id,username,email'])
            ->withCount('products')
            ->where('is_active', true)
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data, User $user): Brand
    {
        $data['user_id'] = $user->id;
        $data['updated_by_id'] = $user->id;

        return Brand::create($data)->load(['user:id,username,email', 'updatedBy:id,username,email'])->loadCount('products');
    }

    public function update(Brand $brand, array $data, User $user): Brand
    {
        $this->ensureCanManage($brand, $user);

        $data['updated_by_id'] = $user->id;

        $brand->update($data);

        return $brand->refresh()->load(['user:id,username,email', 'updatedBy:id,username,email'])->loadCount('products');
    }

    public function delete(Brand $brand, User $user): void
    {
        $this->ensureCanManage($brand, $user);

        $brand->delete();
    }

    public function ensureCanView(Brand $brand, ?User $user): void
    {
        if ($brand->is_active || ($user && ($user->is_admin || $brand->user_id === $user->id))) {
            return;
        }

        abort(404);
    }

    private function ensureCanManage(Brand $brand, User $user): void
    {
        if (! $user->is_admin && $brand->user_id !== $user->id) {
            abort(403, 'You are not allowed to manage this brand.');
        }
    }
}
