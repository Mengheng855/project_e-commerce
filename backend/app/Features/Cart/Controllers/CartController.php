<?php

namespace App\Features\Cart\Controllers;

use App\Features\Cart\Requests\AddCartItemRequest;
use App\Features\Cart\Requests\UpdateCartItemRequest;
use App\Features\Cart\Resources\CartResource;
use App\Features\Cart\Services\CartService;
use App\Features\Order\Resources\OrderResource;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cart)
    {
    }

    public function show(Request $request): CartResource
    {
        return new CartResource($this->cart->getForUser($request->user()));
    }

    public function store(AddCartItemRequest $request): CartResource
    {
        return new CartResource($this->cart->addItem($request->user(), $request->validated()));
    }

    public function update(UpdateCartItemRequest $request, CartItem $item): CartResource
    {
        return new CartResource($this->cart->updateItem($request->user(), $item, $request->validated()));
    }

    public function destroy(Request $request, CartItem $item): CartResource
    {
        return new CartResource($this->cart->removeItem($request->user(), $item));
    }

    public function clear(Request $request): CartResource
    {
        return new CartResource($this->cart->clear($request->user()));
    }

    public function checkout(Request $request): OrderResource
    {
        $data = $request->validate([
            'payment_method' => ['required', 'string', 'in:telegram,bakong,khbakong,cash'],
            'currency' => ['nullable', 'string', 'in:USD,KHR'],
        ]);

        return new OrderResource($this->cart->checkout($request->user(), $data));
    }
}
