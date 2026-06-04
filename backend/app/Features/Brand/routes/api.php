<?php

use App\Features\Brand\Controllers\BrandController;
use Illuminate\Support\Facades\Route;

Route::apiResource('brands', BrandController::class)->only(['index', 'show']);

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::apiResource('brands', BrandController::class)->except(['index', 'show']);
});
