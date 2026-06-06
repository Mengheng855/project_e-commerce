<?php

namespace Tests\Feature;

use App\Models\EmailOtp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_user_cannot_get_token_from_email_verification_with_wrong_otp(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        EmailOtp::create([
            'user_id' => $user->id,
            'otp' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->postJson('/api/v1/auth/verify-email', [
            'email' => $user->email,
            'otp' => '000000',
            'device_name' => 'web',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonMissingPath('data.token');
    }

    public function test_non_admin_customer_is_forbidden_before_admin_route_validation(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'is_admin' => false,
            'is_active' => true,
        ]));

        $response = $this->postJson('/api/v1/categories', []);

        $response->assertForbidden();
    }

    public function test_anonymous_user_management_create_is_not_public(): void
    {
        $response = $this->postJson('/api/v1/users', [
            'username' => 'public_probe',
            'email' => 'public-probe@example.test',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertUnauthorized();
    }

    public function test_registration_stores_hashed_email_otp(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'username' => 'otp_user',
            'email' => 'otp-user@example.test',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertCreated();

        $user = User::where('email', 'otp-user@example.test')->firstOrFail();
        $otp = EmailOtp::where('user_id', $user->id)->firstOrFail();

        $this->assertDoesNotMatchRegularExpression('/^\d{6}$/', $otp->otp);
        $this->assertGreaterThan(50, strlen($otp->otp));
    }

    public function test_email_verification_uses_hashed_otp_and_locks_after_failed_attempts(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $otp = EmailOtp::create([
            'user_id' => $user->id,
            'otp' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(10),
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/verify-email', [
                'email' => $user->email,
                'otp' => '000000',
                'device_name' => 'web',
            ])->assertUnprocessable();
        }

        $this->assertSame(5, $otp->refresh()->attempts);
        $this->assertTrue($otp->locked_until->isFuture());

        $this->postJson('/api/v1/auth/verify-email', [
            'email' => $user->email,
            'otp' => '123456',
            'device_name' => 'web',
        ])->assertUnprocessable();
    }
}
