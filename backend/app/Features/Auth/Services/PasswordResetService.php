<?php

namespace App\Features\Auth\Services;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetService
{
    public function sendResetLink(string $email): void
    {
        $user = User::where('email', $email)->firstOrFail();
        $token = Str::random(64);
        $resetUrl = $this->resetUrl($user->email, $token);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        Mail::send(
            ['html' => 'emails.password-reset-link', 'text' => 'emails.password-reset-link-text'],
            ['resetUrl' => $resetUrl],
            function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Reset your TosTinh password');
            }
        );
    }

    public function reset(array $data): void
    {
        $user = User::where('email', $data['email'])->firstOrFail();
        $reset = DB::table('password_reset_tokens')->where('email', $user->email)->first();

        if (! $reset || ! Hash::check($data['token'], $reset->token) || $this->tokenExpired($reset->created_at)) {
            throw ValidationException::withMessages([
                'token' => ['This password reset link is invalid or expired.'],
            ]);
        }

        $user->update([
            'password' => $data['password'],
        ]);

        DB::table('password_reset_tokens')->where('email', $user->email)->delete();
        $user->tokens()->delete();
    }

    private function resetUrl(string $email, string $token): string
    {
        $frontendUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/');
        $query = http_build_query([
            'email' => $email,
            'token' => $token,
        ]);

        return "{$frontendUrl}/reset-password?{$query}";
    }

    private function tokenExpired(?string $createdAt): bool
    {
        if (! $createdAt) {
            return true;
        }

        return Carbon::parse($createdAt)->addMinutes(60)->isPast();
    }
}
