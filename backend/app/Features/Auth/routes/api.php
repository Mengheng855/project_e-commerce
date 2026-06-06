<?php

use App\Features\Auth\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:auth-register');
Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:auth-login');
Route::post('auth/verify-email', [AuthController::class, 'verifyEmail'])->middleware('throttle:auth-verify-email');
Route::post('auth/email-verification/resend', [AuthController::class, 'resendEmailVerification'])->middleware('throttle:auth-resend-email');
Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth-password');
Route::post('auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:auth-password');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::post('auth/logout-all', [AuthController::class, 'logoutAll']);
});
