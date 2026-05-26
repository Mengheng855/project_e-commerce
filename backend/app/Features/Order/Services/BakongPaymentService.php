<?php

namespace App\Features\Order\Services;

use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use KHQR\BakongKHQR;
use KHQR\Helpers\KHQRData;
use KHQR\Models\IndividualInfo;
use Throwable;

class BakongPaymentService
{
    public function createForOrder(Order $order, string $currency = 'USD'): PaymentTransaction
    {
        $billNumber = $order->order_number;
        $reference = (string) Str::uuid();
        $qrString = $this->createQrString($order, $billNumber, $reference, $currency);

        return PaymentTransaction::create([
            'order_id' => $order->id,
            'amount' => $order->total_amount,
            'payment_method' => 'bakong',
            'currency' => $currency,
            'status' => 'pending',
            'qr_code_string' => $qrString,
            'qr_code_md5' => md5($qrString),
            'bakong_bill_number' => $billNumber,
            'bakong_reference' => $reference,
            'gateway_response' => json_encode([
                'mode' => config('services.bakong.api_base_url') ? 'api' : 'local-placeholder',
            ]),
            'expires_at' => now()->addMinutes(5),
        ]);
    }

    private function createQrString(Order $order, string $billNumber, string $reference, string $currency): string
    {
        $apiBaseUrl = config('services.bakong.api_base_url');

        if ($apiBaseUrl) {
            try {
                $response = Http::timeout(15)
                    ->withToken(config('services.bakong.token'))
                    ->post(rtrim($apiBaseUrl, '/') . '/khqr/create', [
                        'amount' => (float) $order->total_amount,
                        'currency' => $currency,
                        'bakong_account' => config('services.bakong.bank_account'),
                        'merchant_name' => config('services.bakong.merchant_name'),
                        'merchant_city' => config('services.bakong.merchant_city'),
                        'phone' => config('services.bakong.phone'),
                        'bill_number' => $billNumber,
                        'reference' => $reference,
                    ]);

                if ($response->successful()) {
                    return $response->json('qr_code_string')
                        ?? $response->json('qr')
                        ?? $response->json('data.qr')
                        ?? $response->body();
                }
            } catch (Throwable) {
                // Fall back to local KHQR generation below.
            }
        }

        $account = config('services.bakong.bank_account');
        $merchantName = config('services.bakong.merchant_name');
        $merchantCity = config('services.bakong.merchant_city', 'Phnom Penh');

        if (! $account || ! $merchantName) {
            throw ValidationException::withMessages([
                'payment_method' => ['Bakong is not configured. Please set BAKONG_BANK_ACCOUNT and BAKONG_MERCHANT_NAME.'],
            ]);
        }

        $response = BakongKHQR::generateIndividual(new IndividualInfo(
            bakongAccountID: $account,
            merchantName: $merchantName,
            merchantCity: $merchantCity,
            currency: strtoupper($currency) === 'KHR' ? KHQRData::CURRENCY_KHR : KHQRData::CURRENCY_USD,
            amount: (float) $order->total_amount,
            billNumber: $billNumber,
            mobileNumber: config('services.bakong.phone'),
            storeLabel: 'TosTinh',
            purposeOfTransaction: 'Order '.$order->order_number,
            expirationTimestamp: (string) now()->addMinutes(5)->valueOf(),
        ));

        $qr = $response->data['qr'] ?? null;

        if (! $qr || ! BakongKHQR::verify($qr)->isValid) {
            throw ValidationException::withMessages([
                'payment_method' => ['Could not create a valid Bakong KHQR code.'],
            ]);
        }

        return $qr;
    }

    public function checkPayment(PaymentTransaction $payment): array
    {
        $token = config('services.bakong.token');

        if (! $token) {
            throw ValidationException::withMessages([
                'payment' => ['Bakong token is missing. Cannot verify this payment.'],
            ]);
        }

        try {
            $result = (new BakongKHQR($token))->checkTransactionByMD5((string) $payment->qr_code_md5);
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'payment' => ['Bakong has not confirmed this payment yet. Please try again after paying.'],
            ]);
        }

        if (! $this->isPaidResponse($result)) {
            throw ValidationException::withMessages([
                'payment' => ['Bakong has not confirmed this payment yet. Please try again after paying.'],
            ]);
        }

        return $result;
    }

    private function isPaidResponse(array $result): bool
    {
        $responseCode = $result['responseCode'] ?? $result['status']['code'] ?? $result['code'] ?? null;
        $data = $result['data'] ?? null;

        return in_array($responseCode, [0, '0', 200, '200'], true)
            && ! empty($data);
    }
}
