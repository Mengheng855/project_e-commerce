<?php

namespace App\Features\Auth\Services;

use App\Models\EmailOtp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): User
    {
        $user = User::create([
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => $data['password'],
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
        ]);

        $this->sendEmailVerificationOtp($user);

        return $user;
    }

    public function login(array $data, ?Request $request = null): array
    {
        $user = User::query()
            ->where('email', $data['login'])
            ->orWhere('username', $data['login'])
            ->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'login' => ['This account is inactive.'],
            ]);
        }

        if (! $user->email_verified_at) {
            $this->sendEmailVerificationOtp($user);

            throw ValidationException::withMessages([
                'login' => ['Please verify your email. We sent a new verification code.'],
                'email' => [$user->email],
            ]);
        }

        return $this->tokenResponse($user->load('profile'), $data['device_name'] ?? null, $request, $data);
    }

    public function verifyEmail(array $data, ?Request $request = null): array
    {
        $user = User::where('email', $data['email'])->firstOrFail();

        if ($user->email_verified_at) {
            return $this->tokenResponse($user, $data['device_name'] ?? null, $request, $data);
        }

        $otp = EmailOtp::where('user_id', $user->id)
            ->where('otp', $data['otp'])
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $otp) {
            throw ValidationException::withMessages([
                'otp' => ['The verification code is invalid or expired.'],
            ]);
        }

        $user->forceFill(['email_verified_at' => now()])->save();
        $otp->update(['is_used' => true]);

        return $this->tokenResponse($user->refresh()->load('profile'), $data['device_name'] ?? null, $request, $data);
    }

    public function resendEmailVerification(string $email): void
    {
        $user = User::where('email', $email)->firstOrFail();

        if ($user->email_verified_at) {
            return;
        }

        $this->sendEmailVerificationOtp($user);
    }

    public function logout(User $user): void
    {
        $token = $user->currentAccessToken();

        if ($token) {
            $user->loginSessions()
                ->where('personal_access_token_id', $token->id)
                ->whereNull('logged_out_at')
                ->update(['logged_out_at' => now(), 'last_active_at' => now()]);
        }

        $token?->delete();
    }

    public function logoutAll(User $user): void
    {
        $user->loginSessions()
            ->whereNull('logged_out_at')
            ->update(['logged_out_at' => now(), 'last_active_at' => now()]);

        $user->tokens()->delete();
    }

    private function sendEmailVerificationOtp(User $user): void
    {
        $otp = (string) random_int(100000, 999999);

        EmailOtp::where('user_id', $user->id)
            ->where('is_used', false)
            ->update(['is_used' => true]);

        EmailOtp::create([
            'user_id' => $user->id,
            'otp' => $otp,
            'expires_at' => now()->addMinutes(10),
        ]);

        Mail::send(
            ['html' => 'emails.verify-email-otp', 'text' => 'emails.verify-email-otp-text'],
            ['otp' => $otp],
            function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Verify your TosTinh email');
            }
        );
    }

    private function tokenResponse(User $user, ?string $deviceName, ?Request $request = null, array $data = []): array
    {
        $token = $user->createToken($deviceName ?: 'api-token');

        if ($request) {
            $this->recordLoginSession($user, $token->accessToken->id, $deviceName, $request, $data);
        }

        return [
            'token' => $token->plainTextToken,
            'user' => $user,
        ];
    }

    private function recordLoginSession(User $user, int $tokenId, ?string $deviceName, Request $request, array $data): void
    {
        $userAgent = (string) $request->userAgent();
        $device = $this->parseDevice($userAgent);

        $user->loginSessions()->create([
            'personal_access_token_id' => $tokenId,
            'device_name' => $deviceName ?: trim($device['browser'].' on '.$device['platform']),
            'browser' => $device['browser'],
            'platform' => $device['platform'],
            'ip_address' => $request->ip(),
            'country' => $data['country'] ?? null,
            'city' => $data['city'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'user_agent' => $userAgent,
            'logged_in_at' => now(),
            'last_active_at' => now(),
        ]);
    }

    private function parseDevice(string $userAgent): array
    {
        $browser = 'Unknown browser';
        if (str_contains($userAgent, 'Edg/')) {
            $browser = 'Microsoft Edge';
        } elseif (str_contains($userAgent, 'Chrome/')) {
            $browser = 'Chrome';
        } elseif (str_contains($userAgent, 'Firefox/')) {
            $browser = 'Firefox';
        } elseif (str_contains($userAgent, 'Safari/') && str_contains($userAgent, 'Version/')) {
            $browser = 'Safari';
        }

        $platform = 'Unknown device';
        if (str_contains($userAgent, 'Windows')) {
            $platform = 'Windows';
        } elseif (str_contains($userAgent, 'Android')) {
            $platform = 'Android';
        } elseif (str_contains($userAgent, 'iPhone')) {
            $platform = 'iPhone';
        } elseif (str_contains($userAgent, 'iPad')) {
            $platform = 'iPad';
        } elseif (str_contains($userAgent, 'Mac OS X')) {
            $platform = 'macOS';
        } elseif (str_contains($userAgent, 'Linux')) {
            $platform = 'Linux';
        }

        return ['browser' => $browser, 'platform' => $platform];
    }
}
