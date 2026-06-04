<?php

use App\Features\Order\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('orders/{order}/bakong/confirm', [OrderController::class, 'confirmBakongPayment']);
    Route::apiResource('orders', OrderController::class)->only(['index', 'store', 'show']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
});
