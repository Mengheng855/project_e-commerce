<?php

use App\Features\Banner\Controllers\BannerController;
use Illuminate\Support\Facades\Route;

Route::get('banners', [BannerController::class, 'index'])->name('banners.index');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('admin/banners', [BannerController::class, 'all'])->name('admin.banners.all');
    Route::post('admin/banners/upload', [BannerController::class, 'upload'])->name('admin.banners.upload');
    Route::get('admin/banners/{banner}', [BannerController::class, 'show'])->name('admin.banners.show');
    Route::delete('admin/banners/{banner}', [BannerController::class, 'destroy'])->name('admin.banners.destroy');
    Route::put('admin/banners/{banner}', [BannerController::class, 'update'])->name('admin.banners.update');
    Route::post('admin/banners', [BannerController::class, 'store'])->name('admin.banners.store');
});
