<?php

namespace App\Features\Brand\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $brand = $this->route('brand');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('brands', 'name')->ignore($brand?->id)],
            'slug' => ['sometimes', 'string', 'max:100', Rule::unique('brands', 'slug')->ignore($brand?->id)],
            'logo' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'website' => ['sometimes', 'nullable', 'url', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
