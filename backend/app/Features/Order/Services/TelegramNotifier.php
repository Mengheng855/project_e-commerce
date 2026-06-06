<?php

namespace App\Features\Order\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class TelegramNotifier
{
    public function orderCreated(Order $order): void
    {
        $token = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');

        if (! $token || ! $chatId) {
            Log::info('Telegram order notification skipped: missing bot token or chat id.', [
                'order_id' => $order->id,
            ]);

            return;
        }

        $itemLines = $order->items->map(function ($item, int $index) {
            $line = ($index + 1).'. '.$item->product_name.' x'.$item->qty.' - $'.$item->price;

            if ($item->variant_label) {
                $line .= "\n   Options: {$item->variant_label}";
            }

            return $line;
        })->implode("\n");

        $user = $order->relationLoaded('user') ? $order->user : null;
        $profile = $user?->relationLoaded('profile') ? $user->profile : null;
        $fullName = trim(($user?->first_name ?? '').' '.($user?->last_name ?? ''));
        $customerLines = collect([
            'Username: '.($user?->username ?? 'User #'.$order->user_id),
            $fullName !== '' ? 'Name: '.$fullName : null,
            $user?->email ? 'Email: '.$user->email : null,
            $profile?->phone_number ? 'Phone: '.$profile->phone_number : null,
            $profile?->address ? 'Address: '.$profile->address : null,
        ])->filter()->implode("\n");

        $payment = $order->relationLoaded('paymentTransactions') ? $order->paymentTransactions->first() : null;
        $paymentLine = $payment
            ? 'Payment: '.strtoupper($payment->payment_method).' / '.$payment->status."\n"
            : '';

        $message = "New TosTinh order {$order->order_number}\n"
            . "Status: {$order->status}\n"
            . $paymentLine
            . "Total: $ {$order->total_amount}\n\n"
            . "Customer:\n{$customerLines}\n\n"
            . "Items:\n{$itemLines}";

        try {
            $response = Http::timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
            ]);

            if ($response->failed()) {
                Log::warning('Telegram order notification failed.', [
                    'order_id' => $order->id,
                    'status' => $response->status(),
                    'response' => $response->json() ?? $response->body(),
                ]);
            }
        } catch (Throwable $exception) {
            Log::warning('Telegram order notification failed.', [
                'order_id' => $order->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
