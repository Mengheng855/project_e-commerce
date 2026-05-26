<?php

namespace App\Features\Product\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $product = $this->route('product');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('products', 'name')->ignore($product?->id)],
            'slug' => [
                'sometimes',
                'string',
                'max:150',
                Rule::unique('products', 'slug')->ignore($product?->id),
            ],
            'description' => ['sometimes', 'nullable', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'original_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'image' => ['sometimes', 'nullable', 'string', 'max:255'],
            'images' => ['sometimes', 'array', 'max:12'],
            'images.*.image' => ['required_with:images', 'string', 'max:255'],
            'images.*.alt_text' => ['nullable', 'string', 'max:150'],
            'images.*.is_primary' => ['nullable', 'boolean'],
            'images.*.order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'brand_id' => ['sometimes', 'nullable', 'integer', 'exists:brands,id'],
            'specifications' => ['sometimes', 'array', 'max:50'],
            'specifications.*.key' => ['required_with:specifications', 'string', 'max:100'],
            'specifications.*.value' => ['required_with:specifications', 'string'],
            'specifications.*.order' => ['nullable', 'integer', 'min:0'],
            'variants' => ['sometimes', 'array', 'max:50'],
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
