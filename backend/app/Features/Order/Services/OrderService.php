<?php

namespace App\Features\Order\Services;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(
        private readonly TelegramNotifier $telegram,
        private readonly BakongPaymentService $bakong
    )
    {
    }

    public function paginate(User $user, array $filters = []): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 10), 50));

        return Order::query()
            ->with(['items', 'paymentTransactions', 'user:id,username,email,first_name,last_name'])
            ->when(! $user->is_admin, fn ($query) => $query->where('user_id', $user->id))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data, User $user): Order
    {
        return DB::transaction(function () use ($data, $user) {
            $items = collect($data['items']);
            $products = Product::whereIn('id', $items->pluck('product_id'))->get()->keyBy('id');
            $total = 0.0;

            foreach ($items as $item) {
                $product = $products->get($item['product_id']);
                $total += (float) $product->price * (int) $item['qty'];
            }

            $order = Order::create([
                'order_number' => $this->makeOrderNumber(),
                'total_amount' => number_format($total, 2, '.', ''),
                'status' => 'pending',
                'user_id' => $user->id,
            ]);

            foreach ($items as $item) {
                $product = $products->get($item['product_id']);
                $this->decreaseProductStock($product, (int) $item['qty']);

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'variant_label' => $item['variant_label'] ?? null,
                    'selected_options' => $item['selected_options'] ?? null,
                    'qty' => $item['qty'],
                    'price' => $product->price,
                    'delivery_address' => $item['delivery_address'] ?? null,
                    'delivery_lat' => $item['delivery_lat'] ?? null,
                    'delivery_lng' => $item['delivery_lng'] ?? null,
                ]);
            }

            $order->update(['stock_decreased_at' => now()]);

            $isBakong = in_array($data['payment_method'] ?? 'cash', ['bakong', 'khbakong'], true);

            if ($isBakong) {
                $this->bakong->createForOrder($order, $data['currency'] ?? 'USD');
            } else {
                $paymentMethod = ($data['payment_method'] ?? 'telegram') === 'cash' ? 'cash' : 'telegram';

                $order->paymentTransactions()->create([
                    'amount' => $order->total_amount,
                    'payment_method' => $paymentMethod,
                    'currency' => $data['currency'] ?? 'USD',
                    'status' => 'pending',
                    'gateway_response' => $paymentMethod === 'telegram'
                        ? 'Customer selected Telegram order. Admin should contact the customer to confirm delivery and payment.'
                        : 'Customer selected cash on delivery. Collect payment when delivering the order.',
                ]);
            }

            $order->load(['items', 'paymentTransactions', 'user.profile', 'user:id,username,email,first_name,last_name']);

            if (! $isBakong) {
                $this->telegram->orderCreated($order);
            }

            return $order;
        });
    }

    public function show(Order $order, User $user): Order
    {
        if (! $user->is_admin && $order->user_id !== $user->id) {
            abort(403, 'You are not allowed to view this order.');
        }

        return $order->load(['items', 'paymentTransactions', 'user:id,username,email,first_name,last_name']);
    }


    public function updateStatus(Order $order, User $user, string $status): Order
    {
        if (! $user->is_admin) {
            abort(403, 'Admin access is required.');
        }

        $allowedStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'failed'];
        $nextStatus = strtolower($status);

        if (! in_array($nextStatus, $allowedStatuses, true)) {
            abort(422, 'Invalid order status.');
        }

        return DB::transaction(function () use ($order, $nextStatus) {
            $order->load('items');
            $currentIsReduced = (bool) $order->stock_decreased_at;
            $nextIsReduced = $this->statusKeepsInventoryReduced($nextStatus);
            $stockDecreasedAt = $order->stock_decreased_at;

            if ($currentIsReduced && ! $nextIsReduced) {
                $this->restoreOrderStock($order);
                $stockDecreasedAt = null;
            }

            if (! $currentIsReduced && $nextIsReduced) {
                $this->decreaseOrderStock($order);
                $stockDecreasedAt = now();
            }

            $order->update([
                'status' => $nextStatus,
                'stock_decreased_at' => $stockDecreasedAt,
            ]);

            $this->syncPaymentStatus($order, $nextStatus);

            return $order->load(['items', 'paymentTransactions', 'user:id,username,email,first_name,last_name']);
        });
    }

    public function confirmBakongPayment(Order $order, User $user): Order
    {
        if (! $user->is_admin && $order->user_id !== $user->id) {
            abort(403, 'You are not allowed to confirm this order.');
        }

        return DB::transaction(function () use ($order) {
            $order->load(['items', 'paymentTransactions', 'user.profile', 'user:id,username,email,first_name,last_name']);

            $payment = $order->paymentTransactions
                ->first(fn (PaymentTransaction $transaction) => $transaction->payment_method === 'bakong');

            if (! $payment) {
                throw ValidationException::withMessages([
                    'payment' => ['This order does not have a Bakong payment.'],
                ]);
            }

            $shouldNotify = $payment->status !== 'paid';

            if ($payment->status !== 'paid') {
                $result = $this->bakong->checkPayment($payment);

                $payment->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'gateway_response' => json_encode($result),
                ]);
            }

            if ($order->status === 'pending') {
                $order->update(['status' => 'paid']);
            }

            $order->load(['items', 'paymentTransactions', 'user.profile', 'user:id,username,email,first_name,last_name']);

            if ($shouldNotify) {
                $this->telegram->orderCreated($order);
            }

            return $order;
        });
    }



    private function syncPaymentStatus(Order $order, string $status): void
    {
        $paymentStatus = match ($status) {
            'paid', 'shipped', 'delivered' => 'paid',
            'cancelled' => 'cancelled',
            'failed' => 'failed',
            default => 'pending',
        };

        $updates = ['status' => $paymentStatus];

        if ($paymentStatus === 'paid') {
            $updates['paid_at'] = now();
        }

        if ($paymentStatus !== 'paid') {
            $updates['paid_at'] = null;
        }

        $order->paymentTransactions()->update($updates);
    }

    private function statusKeepsInventoryReduced(string $status): bool
    {
        return ! in_array($status, ['cancelled', 'failed'], true);
    }

    private function decreaseOrderStock(Order $order): void
    {
        foreach ($order->items as $item) {
            if (! $item->product_id) {
                continue;
            }

            $product = Product::query()->find($item->product_id);

            if ($product) {
                $this->decreaseProductStock($product, (int) $item->qty, $item->selected_options ?? []);
            }
        }
    }

    private function restoreOrderStock(Order $order): void
    {
        foreach ($order->items as $item) {
            if (! $item->product_id) {
                continue;
            }

            Product::query()->whereKey($item->product_id)->increment('stock', (int) $item->qty);

            $variantIds = collect($item->selected_options ?? [])->pluck('variant_id')->filter()->map(fn ($id) => (int) $id)->values();

            if ($variantIds->isNotEmpty()) {
                ProductVariant::query()->whereIn('id', $variantIds)->increment('stock', (int) $item->qty);
            }
        }
    }

    private function decreaseProductStock(Product $product, int $qty, array $selectedOptions = []): void
    {
        $variantIds = collect($selectedOptions)->pluck('variant_id')->filter()->map(fn ($id) => (int) $id)->values();
        $variants = $variantIds->isEmpty()
            ? collect()
            : ProductVariant::query()->where('product_id', $product->id)->whereIn('id', $variantIds)->get();
        $availableStock = $variants->isEmpty()
            ? (int) $product->stock
            : min((int) $product->stock, (int) $variants->min('stock'));

        if ($qty > $availableStock) {
            throw ValidationException::withMessages([
                'stock' => ['Only '.$availableStock.' item(s) are available for '.$product->name.'.'],
            ]);
        }

        $productUpdated = Product::query()->whereKey($product->id)->where('stock', '>=', $qty)->decrement('stock', $qty);

        if (! $productUpdated) {
            throw ValidationException::withMessages([
                'stock' => ['Not enough stock for '.$product->name.'.'],
            ]);
        }

        foreach ($variants as $variant) {
            $variantUpdated = ProductVariant::query()->whereKey($variant->id)->where('stock', '>=', $qty)->decrement('stock', $qty);

            if (! $variantUpdated) {
                throw ValidationException::withMessages([
                    'stock' => ['Not enough stock for '.$product->name.' '.$variant->value.'.'],
                ]);
            }
        }
    }

    private function makeOrderNumber(): string
    {
        do {
            $number = 'ORD-' . now()->format('ymd') . '-' . random_int(100000, 999999);
        } while (Order::where('order_number', $number)->exists());

        return $number;
    }
}
