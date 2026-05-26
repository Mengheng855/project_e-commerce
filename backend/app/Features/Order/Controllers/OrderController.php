<?php

namespace App\Features\Order\Controllers;

use App\Features\Order\Requests\StoreOrderRequest;
use App\Features\Order\Resources\OrderResource;
use App\Features\Order\Services\OrderService;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders)
    {
    }

    public function index(Request $request)
    {
        return OrderResource::collection($this->orders->paginate($request->user(), $request->only(['per_page'])));
    }

    public function store(StoreOrderRequest $request)
    {
        return (new OrderResource($this->orders->create($request->validated(), $request->user())))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Order $order)
    {
        return new OrderResource($this->orders->show($order, $request->user()));
    }


    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:pending,paid,shipped,delivered,cancelled,failed'],
        ]);

        return new OrderResource($this->orders->updateStatus($order, $request->user(), $data['status']));
    }

    public function confirmBakongPayment(Request $request, Order $order)
    {
        return new OrderResource($this->orders->confirmBakongPayment($order, $request->user()));
    }

}
