<?php

namespace App\Features\Cart\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Collection;
use App\Features\Order\Services\BakongPaymentService;
use App\Features\Order\Services\TelegramNotifier;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function __construct(
        private readonly TelegramNotifier $telegram,
        private readonly BakongPaymentService $bakong
    )
    {
    }

    public function getForUser(User $user): Cart
    {
        return $this->cartForUser($user)->load($this->relations());
    }

    public function addItem(User $user, array $data): Cart
    {
        return DB::transaction(function () use ($user, $data) {
            $cart = $this->cartForUser($user);
            $product = Product::query()
                ->with('variants.variantType:id,name')
                ->where('is_active', true)
                ->findOrFail($data['product_id']);
            $qty = (int) ($data['qty'] ?? 1);
            $selectedOptions = $this->normalizeSelectedOptions($product, $data['selected_options'] ?? []);
            $selectedVariants = collect($selectedOptions)->pluck('variant');
            $unitPrice = (float) $product->price + $selectedVariants->sum(fn ($variant) => (float) $variant->price_modifier);
            $selectionHash = $this->selectionHash($selectedOptions);
            $availableStock = $this->availableStock($product, $selectedVariants);

            if ($qty > $availableStock) {
                throw ValidationException::withMessages([
                    'qty' => ['Only '.$availableStock.' item(s) are available for this selection.'],
                ]);
            }

            $item = CartItem::query()
                ->where('cart_id', $cart->id)
                ->where('product_id', $product->id)
                ->where('selection_hash', $selectionHash)
                ->first();

            if ($item) {
                $nextQty = $item->qty + $qty;

                if ($nextQty > $availableStock) {
                    throw ValidationException::withMessages([
                        'qty' => ['Only '.$availableStock.' item(s) are available for this selection.'],
                    ]);
                }

                $item->update(['qty' => $nextQty, 'unit_price' => $unitPrice]);
            } else {
                $cart->items()->create([
                    'product_id' => $product->id,
                    'variant_id' => null,
                    'selected_options' => $this->serializeSelectedOptions($selectedOptions),
                    'variant_label' => $this->variantLabel($selectedOptions),
                    'selection_hash' => $selectionHash,
                    'qty' => $qty,
                    'unit_price' => $unitPrice,
                ]);
            }

            return $cart->refresh()->load($this->relations());
        });
    }

    public function updateItem(User $user, CartItem $item, array $data): Cart
    {
        $cart = $this->cartForUser($user);

        if ($item->cart_id !== $cart->id) {
            abort(404);
        }

        $item->update(['qty' => (int) $data['qty']]);

        return $cart->refresh()->load($this->relations());
    }

    public function removeItem(User $user, CartItem $item): Cart
    {
        $cart = $this->cartForUser($user);

        if ($item->cart_id !== $cart->id) {
            abort(404);
        }

        $item->delete();

        return $cart->refresh()->load($this->relations());
    }

    public function clear(User $user): Cart
    {
        $cart = $this->cartForUser($user);
        $cart->items()->delete();

        return $cart->refresh()->load($this->relations());
    }

    public function checkout(User $user, array $data = []): Order
    {
        return DB::transaction(function () use ($user, $data) {
            $user->loadMissing('profile');

            if (! $user->profile?->phone_number) {
                throw ValidationException::withMessages([
                    'phone_number' => ['Please add your phone number before checkout.'],
                ]);
            }

            $cart = $this->cartForUser($user)->load($this->relations());

            if ($cart->items->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => ['Your cart is empty.'],
                ]);
            }

            $total = $cart->items->sum(fn (CartItem $item) => (float) $item->unit_price * (int) $item->qty);

            $order = Order::query()->create([
                'order_number' => $this->makeOrderNumber(),
                'total_amount' => number_format($total, 2, '.', ''),
                'status' => 'pending',
                'user_id' => $user->id,
            ]);

            foreach ($cart->items as $item) {
                if (! $item->product) {
                    continue;
                }

                $this->decreaseStock($item);

                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'variant_label' => $item->variant_label,
                    'selected_options' => $item->selected_options,
                    'qty' => $item->qty,
                    'price' => $item->unit_price,
                ]);
            }

            $order->update(['stock_decreased_at' => now()]);

            if (in_array($data['payment_method'] ?? 'cash', ['bakong', 'khbakong'], true)) {
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

            $cart->items()->delete();

            $order->load(['items', 'paymentTransactions', 'user.profile', 'user:id,username,email,first_name,last_name']);

            if (! in_array($data['payment_method'] ?? 'telegram', ['bakong', 'khbakong'], true)) {
                $this->telegram->orderCreated($order);
            }

            return $order;
        });
    }

    private function decreaseStock(CartItem $item): void
    {
        $qty = (int) $item->qty;
        $product = Product::query()->findOrFail($item->product_id);
        $variantIds = collect($item->selected_options ?? [])->pluck('variant_id')->filter()->map(fn ($id) => (int) $id)->values();
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

        $productUpdated = Product::query()
            ->whereKey($product->id)
            ->where('stock', '>=', $qty)
            ->decrement('stock', $qty);

        if (! $productUpdated) {
            throw ValidationException::withMessages([
                'stock' => ['Not enough stock for '.$product->name.'.'],
            ]);
        }

        foreach ($variants as $variant) {
            $variantUpdated = ProductVariant::query()
                ->whereKey($variant->id)
                ->where('stock', '>=', $qty)
                ->decrement('stock', $qty);

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
        } while (Order::query()->where('order_number', $number)->exists());

        return $number;
    }

    private function cartForUser(User $user): Cart
    {
        return Cart::query()->firstOrCreate(['user_id' => $user->id]);
    }

    private function normalizeSelectedOptions(Product $product, array $selectedOptions): array
    {
        $activeVariants = $product->variants->where('is_active', true)->values();
        $variantGroups = $activeVariants->groupBy(fn ($variant) => $variant->variantType?->name ?? 'Option');

        if ($variantGroups->isEmpty()) {
            return [];
        }

        $selectedIds = collect($selectedOptions)
            ->pluck('variant_id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $selectedVariants = $activeVariants->whereIn('id', $selectedIds)->values();

        if ($selectedVariants->count() !== $selectedIds->count()) {
            throw ValidationException::withMessages([
                'selected_options' => ['One or more selected options are invalid for this product.'],
            ]);
        }

        $selectedByType = $selectedVariants->groupBy(fn ($variant) => $variant->variantType?->name ?? 'Option');
        $missingTypes = $variantGroups->keys()->diff($selectedByType->keys())->values();

        if ($missingTypes->isNotEmpty()) {
            throw ValidationException::withMessages([
                'selected_options' => ['Choose '.implode(', ', $missingTypes->all()).' before adding to cart.'],
            ]);
        }

        $duplicateTypes = $selectedByType->filter(fn (Collection $variants) => $variants->count() > 1)->keys()->values();

        if ($duplicateTypes->isNotEmpty()) {
            throw ValidationException::withMessages([
                'selected_options' => ['Choose only one value for '.implode(', ', $duplicateTypes->all()).'.'],
            ]);
        }

        return $selectedVariants
            ->sortBy(fn ($variant) => $variant->variantType?->name ?? 'Option')
            ->map(fn ($variant) => [
                'type' => $variant->variantType?->name ?? 'Option',
                'value' => $variant->value,
                'variant' => $variant,
            ])
            ->values()
            ->all();
    }

    private function serializeSelectedOptions(array $selectedOptions): array
    {
        return collect($selectedOptions)->map(fn ($option) => [
            'variant_id' => $option['variant']->id,
            'type' => $option['type'],
            'value' => $option['value'],
            'color_hex' => $option['variant']->color_hex,
            'price_modifier' => $option['variant']->price_modifier,
        ])->values()->all();
    }

    private function variantLabel(array $selectedOptions): ?string
    {
        if ($selectedOptions === []) {
            return null;
        }

        return collect($selectedOptions)
            ->map(fn ($option) => $option['type'].': '.$option['value'])
            ->implode(', ');
    }

    private function selectionHash(array $selectedOptions): string
    {
        if ($selectedOptions === []) {
            return 'base';
        }

        $ids = collect($selectedOptions)->map(fn ($option) => $option['variant']->id)->sort()->values()->all();

        return hash('sha256', implode('|', $ids));
    }

    private function availableStock(Product $product, Collection $selectedVariants): int
    {
        if ($selectedVariants->isEmpty()) {
            return (int) $product->stock;
        }

        return min((int) $product->stock, $selectedVariants->min('stock'));
    }

    private function relations(): array
    {
        return ['items.product:id,name,slug,image,price,stock'];
    }
}
