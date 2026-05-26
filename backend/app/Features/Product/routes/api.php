<?php

use App\Features\Product\Controllers\ProductController;
use App\Features\Product\Controllers\ProductImageUploadController;
use App\Features\Product\Controllers\VariantTypeController;
use Illuminate\Support\Facades\Route;
 
Route::apiResource('products', ProductController::class)->only(['index', 'show']);
Route::get('variant-types', [VariantTypeController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('product-images/upload', ProductImageUploadController::class);
    Route::post('variant-types', [VariantTypeController::class, 'store']);
    Route::put('variant-types/{variantType}', [VariantTypeController::class, 'update']);
    Route::delete('variant-types/{variantType}', [VariantTypeController::class, 'destroy']);
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);
});
