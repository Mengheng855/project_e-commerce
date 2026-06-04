<?php

use App\Features\User\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('me', [UserController::class, 'me']);
    Route::patch('me', [UserController::class, 'updateMe']);
    Route::post('me/avatar', [UserController::class, 'uploadAvatar']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::apiResource('users', UserController::class);
});
