<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('auth-login', function (Request $request) {
            return Limit::perMinute(5)->by($this->throttleKey($request, 'login'));
        });

        RateLimiter::for('auth-verify-email', function (Request $request) {
            return Limit::perMinute(5)->by($this->throttleKey($request, 'verify-email'));
        });

        RateLimiter::for('auth-resend-email', function (Request $request) {
            return Limit::perMinutes(5, 3)->by($this->throttleKey($request, 'resend-email'));
        });

        RateLimiter::for('auth-register', function (Request $request) {
            return Limit::perMinutes(5, 3)->by($this->throttleKey($request, 'register'));
        });

        RateLimiter::for('auth-password', function (Request $request) {
            return Limit::perMinutes(5, 3)->by($this->throttleKey($request, 'password'));
        });
    }

    private function throttleKey(Request $request, string $prefix): string
    {
        $identity = (string) ($request->input('email') ?? $request->input('login') ?? '');

        return $prefix.'|'.mb_strtolower($identity).'|'.$request->ip();
    }
}
