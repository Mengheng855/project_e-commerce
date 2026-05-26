<?php

namespace App\Features\Cart\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'qty' => ['nullable', 'integer', 'min:1', 'max:99'],
            'selected_options' => ['nullable', 'array', 'max:20'],
            'selected_options.*.variant_id' => ['required_with:selected_options', 'integer', 'exists:product_variants,id'],
        ];
    }
}
