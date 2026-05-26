<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    require base_path('app/Features/Auth/routes/api.php');
    require base_path('app/Features/User/routes/api.php');
    require base_path('app/Features/Category/routes/api.php');
    require base_path('app/Features/Brand/routes/api.php');
    require base_path('app/Features/Banner/routes/api.php');
    require base_path('app/Features/Logo/routes/api.php');
    require base_path('app/Features/Product/routes/api.php');
    require base_path('app/Features/Cart/routes/api.php');
    require base_path('app/Features/Order/routes/api.php');
});
