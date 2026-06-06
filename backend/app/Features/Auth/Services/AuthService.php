<?php

namespace App\Features\Auth\Services;

use App\Models\EmailOtp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            throw ValidationException::withMessages([
                'email' => ['This email is already verified. Please log in normally.'],
            ]);
        }

        $otp = EmailOtp::where('user_id', $user->id)
            ->where('otp', $data['otp'])
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if ($otp && $otp->sent_digits_count < 6) {
            throw ValidationException::withMessages([
                'otp' => ['Request all 6 verification digits before verifying.'],
            ]);
        }

        if (! $otp) {
            throw ValidationException::withMessages([
                'otp' => ['The verification code is invalid or expired.'],
            ]);
        }

        DB::transaction(function () use ($user, $otp): void {
            $user->forceFill(['email_verified_at' => now()])->save();
            $otp->update(['is_used' => true]);
        });

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
        $otp = EmailOtp::where('user_id', $user->id)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $otp) {
            EmailOtp::where('user_id', $user->id)
                ->where('is_used', false)
                ->update(['is_used' => true]);

            $otp = EmailOtp::create([
                'user_id' => $user->id,
                'otp' => $this->generateEmailVerificationOtp(),
                'sent_digits_count' => 0,
                'expires_at' => now()->addMinutes(10),
            ]);
        }

        $position = min($otp->sent_digits_count + 1, 6);
        $digit = substr($otp->otp, $position - 1, 1);

        if ($otp->sent_digits_count < 6) {
            $otp->update(['sent_digits_count' => $position]);
        }

        Mail::send(
            ['html' => 'emails.verify-email-otp', 'text' => 'emails.verify-email-otp-text'],
            [
                'digit' => $digit,
                'position' => $position,
                'total' => 6,
            ],
            function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Verify your TosTinh email digit');
            }
        );
    }

    private function generateEmailVerificationOtp(): string
    {
        $otp = '';

        for ($i = 0; $i < 6; $i++) {
            $otp .= (string) random_int(0, 9);
        }

        return $otp;
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
            'ip_address' => $this->clientIp($request),
            'country' => $data['country'] ?? $this->countryFromRequest($request),
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

    private function clientIp(Request $request): ?string
    {
        $cloudflareIp = $this->validIp($request->headers->get('CF-Connecting-IP'));
        if ($cloudflareIp) {
            return $cloudflareIp;
        }

        foreach (explode(',', (string) $request->headers->get('X-Forwarded-For')) as $ip) {
            $forwardedIp = $this->validIp($ip);
            if ($forwardedIp) {
                return $forwardedIp;
            }
        }

        return $request->ip();
    }

    private function validIp(?string $ip): ?string
    {
        $ip = trim((string) $ip);

        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : null;
    }

    private function countryFromRequest(Request $request): ?string
    {
        $countryCode = strtoupper(trim((string) $request->headers->get('CF-IPCountry')));

        if ($countryCode === '' || $countryCode === 'XX') {
            return null;
        }

        return [
            'KH' => 'Cambodia',
            'US' => 'United States',
            'TH' => 'Thailand',
            'VN' => 'Vietnam',
            'CN' => 'China',
            'JP' => 'Japan',
            'KR' => 'South Korea',
            'SG' => 'Singapore',
            'MY' => 'Malaysia',
            'ID' => 'Indonesia',
            'PH' => 'Philippines',
            'LA' => 'Laos',
        ][$countryCode] ?? $countryCode;
    }
}
