<?php

namespace App\Features\Category\Services;

use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class CategoryService
{
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 10), 50));
        $hasProducts = array_key_exists('has_products', $filters) && $filters['has_products'] !== ''
            ? filter_var($filters['has_products'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : null;

        return Category::query()
            ->with(['user:id,username', 'updatedBy:id,username'])
            ->withCount('products')
            ->where('is_active', true)
            ->when($hasProducts === true, fn (Builder $query) => $query->has('products'))
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data, User $user): Category
    {
        $data['user_id'] = $user->id;
        $data['updated_by_id'] = $user->id;

        return Category::create($data)->load(['user:id,username', 'updatedBy:id,username'])->loadCount('products');
    }

    public function update(Category $category, array $data, User $user): Category
    {
        $this->ensureCanManage($category, $user);

        $data['updated_by_id'] = $user->id;

        $category->update($data);

        return $category->refresh()->load(['user:id,username', 'updatedBy:id,username'])->loadCount('products');
    }

    public function delete(Category $category, User $user): void
    {
        $this->ensureCanManage($category, $user);

        $category->delete();
    }

    public function ensureCanView(Category $category, ?User $user): void
    {
        if ($category->is_active || ($user && ($user->is_admin || $category->user_id === $user->id))) {
            return;
        }

        abort(404);
    }

    private function ensureCanManage(Category $category, User $user): void
    {
        if (! $user->is_admin && $category->user_id !== $user->id) {
            abort(403, 'You are not allowed to manage this category.');
        }
    }
}
