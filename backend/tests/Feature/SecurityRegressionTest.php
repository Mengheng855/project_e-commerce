<?php

namespace Tests\Feature;

use App\Models\EmailOtp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
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
            'otp' => '123456',
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

    public function test_email_verification_requires_six_digit_sends_before_verifying(): void
    {
        Mail::fake();

        $this->postJson('/api/v1/auth/register', [
            'username' => 'otp_user',
            'email' => 'otp-user@example.test',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertCreated();

        $user = User::where('email', 'otp-user@example.test')->firstOrFail();
        $otp = EmailOtp::where('user_id', $user->id)->firstOrFail();

        $this->assertSame(1, $otp->sent_digits_count);

        $this->postJson('/api/v1/auth/verify-email', [
            'email' => $user->email,
            'otp' => $otp->otp,
            'device_name' => 'web',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('otp');

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/email-verification/resend', [
                'email' => $user->email,
            ])->assertOk();
        }

        $this->assertSame(6, $otp->refresh()->sent_digits_count);

        $this->postJson('/api/v1/auth/verify-email', [
            'email' => $user->email,
            'otp' => $otp->otp,
            'device_name' => 'web',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.email', $user->email);
    }
}
