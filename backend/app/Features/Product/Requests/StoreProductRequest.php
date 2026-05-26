<?php

namespace App\Features\Product\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('products', 'name')],
            'slug' => ['nullable', 'string', 'max:150', 'unique:products,slug'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'string', 'max:255'],
            'images' => ['nullable', 'array', 'max:12'],
            'images.*.image' => ['required_with:images', 'string', 'max:255'],
            'images.*.alt_text' => ['nullable', 'string', 'max:150'],
            'images.*.is_primary' => ['nullable', 'boolean'],
            'images.*.order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'specifications' => ['nullable', 'array', 'max:50'],
            'specifications.*.key' => ['required_with:specifications', 'string', 'max:100'],
            'specifications.*.value' => ['required_with:specifications', 'string'],
            'specifications.*.order' => ['nullable', 'integer', 'min:0'],
            'variants' => ['nullable', 'array', 'max:50'],
            'variants.*.variant_type_id' => ['nullable', 'integer', 'exists:variant_types,id'],
            'variants.*.variant_type_name' => ['nullable', 'string', 'max:50'],
            'variants.*.value' => ['required_with:variants', 'string', 'max:100'],
            'variants.*.color_hex' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'variants.*.price_modifier' => ['nullable', 'numeric'],
            'variants.*.stock' => ['nullable', 'integer', 'min:0'],
            'variants.*.is_active' => ['nullable', 'boolean'],
        ];
    }
}
