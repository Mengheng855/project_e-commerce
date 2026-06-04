<?php

use App\Features\Logo\Controllers\LogoController;
use Illuminate\Support\Facades\Route;

Route::get('logo', [LogoController::class, 'active']);

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('admin/logos', [LogoController::class, 'index']);
    Route::post('admin/logos/upload', [LogoController::class, 'upload']);
    Route::post('admin/logos', [LogoController::class, 'store']);
    Route::get('admin/logos/{logo}', [LogoController::class, 'show']);
    Route::put('admin/logos/{logo}', [LogoController::class, 'update']);
    Route::patch('admin/logos/{logo}', [LogoController::class, 'update']);
    Route::delete('admin/logos/{logo}', [LogoController::class, 'destroy']);
});
