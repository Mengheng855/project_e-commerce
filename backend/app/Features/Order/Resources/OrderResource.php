<?php

namespace App\Features\Order\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'total_amount' => $this->total_amount,
            'status' => $this->status,
            'stock_decreased_at' => $this->stock_decreased_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'username' => $this->user->username,
                'email' => $this->user->email,
                'first_name' => $this->user->first_name,
                'last_name' => $this->user->last_name,
            ] : null),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'variant_label' => $item->variant_label,
                'selected_options' => $item->selected_options,
                'qty' => $item->qty,
                'price' => $item->price,
                'delivery_address' => $item->delivery_address,
                'delivery_lat' => $item->delivery_lat,
                'delivery_lng' => $item->delivery_lng,
            ])),
            'payment_transactions' => $this->whenLoaded('paymentTransactions', fn () => $this->paymentTransactions->map(fn ($payment) => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'currency' => $payment->currency,
                'status' => $payment->status,
                'qr_code_string' => $payment->qr_code_string,
                'qr_code_md5' => $payment->qr_code_md5,
                'bakong_bill_number' => $payment->bakong_bill_number,
                'bakong_reference' => $payment->bakong_reference,
                'paid_at' => $payment->paid_at?->toISOString(),
                'expires_at' => $payment->expires_at?->toISOString(),
            ])),
        ];
    }
}
