<?php

namespace App\Features\Product\Services;

use App\Models\Product;
use App\Models\User;
use App\Models\VariantType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ProductService
{
    private const LIST_RELATIONS = ['category:id,name,slug', 'brand:id,name,slug', 'user:id,username', 'updatedBy:id,username'];

    private const PRODUCT_RELATIONS = ['category:id,name,slug', 'brand:id,name,slug', 'images', 'specifications', 'variants.variantType:id,name', 'user:id,username', 'updatedBy:id,username'];

    public function paginate(array $filters = []): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 10), 50));
        $isFeatured = array_key_exists('is_featured', $filters) && $filters['is_featured'] !== ''
            ? filter_var($filters['is_featured'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : null;

        return Product::query()
            ->with(self::LIST_RELATIONS)
            ->where('is_active', true)
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($filters['category_id'] ?? null, fn (Builder $query, int $categoryId) => $query->where('category_id', $categoryId))
            ->when($filters['brand_id'] ?? null, fn (Builder $query, int $brandId) => $query->where('brand_id', $brandId))
            ->when($isFeatured !== null, fn (Builder $query) => $query->where('is_featured', $isFeatured))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function loadForDetail(Product $product): Product
    {
        return $product->load(self::PRODUCT_RELATIONS);
    }

    public function create(array $data, User $user): Product
    {
        $images = $data['images'] ?? [];
        $variants = $data['variants'] ?? [];
        $specifications = $data['specifications'] ?? [];
        unset($data['images'], $data['variants'], $data['specifications']);

        if ($images !== []) {
            $data['image'] = $this->primaryImagePath($images);
        }

        $data['user_id'] = $user->id;
        $data['updated_by_id'] = $user->id;
        $product = Product::create($data);

        if ($images !== []) {
            $this->syncImages($product, $images);
        }

        if ($variants !== []) {
            $this->syncVariants($product, $variants);
        }

        if ($specifications !== []) {
            $this->syncSpecifications($product, $specifications);
        }

        return $product->load(self::PRODUCT_RELATIONS);
    }

    public function update(Product $product, array $data, User $user): Product
    {
        $this->ensureCanManage($product, $user);

        $hasImages = array_key_exists('images', $data);
        $hasVariants = array_key_exists('variants', $data);
        $hasSpecifications = array_key_exists('specifications', $data);
        $images = $data['images'] ?? [];
        $variants = $data['variants'] ?? [];
        $specifications = $data['specifications'] ?? [];
        unset($data['images'], $data['variants'], $data['specifications']);

        if ($hasImages) {
            $data['image'] = $this->primaryImagePath($images);
        }

        $data['updated_by_id'] = $user->id;

        $product->update($data);

        if ($hasImages) {
            $this->syncImages($product, $images);
        }

        if ($hasVariants) {
            $this->syncVariants($product, $variants);
        }

        if ($hasSpecifications) {
            $this->syncSpecifications($product, $specifications);
        }

        return $product->refresh()->load(self::PRODUCT_RELATIONS);
    }

    public function delete(Product $product, User $user): void
    {
        $this->ensureCanManage($product, $user);

        $product->delete();
    }

    public function ensureCanView(Product $product, ?User $user): void
    {
        if ($product->is_active) {
            return;
        }

        if ($user && ($user->is_admin || $product->user_id === $user->id)) {
            return;
        }

        abort(404);
    }

    private function syncImages(Product $product, array $images): void
    {
        $product->images()->delete();

        foreach ($this->normalizeImages($images) as $image) {
            $product->images()->create($image);
        }
    }

    private function primaryImagePath(array $images): ?string
    {
        $normalizedImages = $this->normalizeImages($images);
        $primaryImage = collect($normalizedImages)->firstWhere('is_primary', true);

        return ($primaryImage ?? $normalizedImages[0] ?? null)['image'] ?? null;
    }

    private function normalizeImages(array $images): array
    {
        if ($images === []) {
            return [];
        }

        $hasPrimary = collect($images)->contains(
            fn (array $image) => filter_var($image['is_primary'] ?? false, FILTER_VALIDATE_BOOLEAN)
        );

        return collect($images)
            ->values()
            ->map(fn (array $image, int $index) => [
                'image' => $image['image'],
                'alt_text' => $image['alt_text'] ?? null,
                'is_primary' => $hasPrimary
                    ? filter_var($image['is_primary'] ?? false, FILTER_VALIDATE_BOOLEAN)
                    : $index === 0,
                'order' => $image['order'] ?? $index,
            ])
            ->all();
    }

    private function syncSpecifications(Product $product, array $specifications): void
    {
        $product->specifications()->delete();

        foreach (array_values($specifications) as $index => $specification) {
            $key = trim((string) ($specification['key'] ?? ''));
            $value = trim((string) ($specification['value'] ?? ''));

            if ($key === '' || $value === '') {
                continue;
            }

            $product->specifications()->create([
                'key' => $key,
                'value' => $value,
                'order' => $specification['order'] ?? $index,
            ]);
        }
    }

    private function syncVariants(Product $product, array $variants): void
    {
        $product->variants()->delete();

        $savedVariantKeys = [];

        foreach ($variants as $variant) {
            $variantTypeId = $variant['variant_type_id'] ?? null;
            $variantTypeName = trim((string) ($variant['variant_type_name'] ?? ''));

            if (! $variantTypeId && $variantTypeName !== '') {
                $variantTypeId = VariantType::query()->firstOrCreate(['name' => $variantTypeName])->id;
            }

            $value = trim((string) ($variant['value'] ?? ''));

            if (! $variantTypeId || $value === '') {
                continue;
            }

            $uniqueKey = $variantTypeId.'|'.mb_strtolower($value);

            if (isset($savedVariantKeys[$uniqueKey])) {
                continue;
            }

            $savedVariantKeys[$uniqueKey] = true;

            $product->variants()->create([
                'variant_type_id' => $variantTypeId,
                'value' => $value,
                'color_hex' => $variant['color_hex'] ?? null,
                'price_modifier' => $variant['price_modifier'] ?? 0,
                'stock' => $variant['stock'] ?? 0,
                'is_active' => filter_var($variant['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    private function ensureCanManage(Product $product, User $user): void
    {
        if (! $user->is_admin && $product->user_id !== $user->id) {
            abort(403, 'You are not allowed to manage this product.');
        }
    }
}
