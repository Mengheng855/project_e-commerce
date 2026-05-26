<?php

namespace App\Features\Order\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method' => ['nullable', Rule::in(['telegram', 'cash', 'bakong', 'khbakong'])],
            'currency' => ['nullable', Rule::in(['USD', 'KHR'])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.variant_label' => ['nullable', 'string', 'max:200'],
            'items.*.selected_options' => ['nullable', 'array'],
            'items.*.selected_options.*.variant_id' => ['required_with:items.*.selected_options', 'integer', 'exists:product_variants,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.delivery_address' => ['nullable', 'string'],
            'items.*.delivery_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'items.*.delivery_lng' => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }
}
