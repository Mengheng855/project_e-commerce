<?php

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Requests\LoginRequest;
use App\Features\Auth\Requests\ForgotPasswordRequest;
use App\Features\Auth\Requests\RegisterRequest;
use App\Features\Auth\Requests\ResendEmailVerificationRequest;
use App\Features\Auth\Requests\ResetPasswordRequest;
use App\Features\Auth\Requests\VerifyEmailRequest;
use App\Features\Auth\Resources\AuthResource;
use App\Features\Auth\Services\AuthService;
use App\Features\Auth\Services\PasswordResetService;
use App\Features\User\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $auth,
        private readonly PasswordResetService $passwordReset
    )
    {
    }

    public function register(RegisterRequest $request)
    {
        $user = $this->auth->register($request->validated());

        return response()->json([
            'message' => 'Account created. Verification code sent to email.',
            'data' => [
                'email' => $user->email,
                'requires_email_verification' => true,
            ],
        ], 201);
    }

    public function verifyEmail(VerifyEmailRequest $request)
    {
        return new AuthResource($this->auth->verifyEmail($request->validated(), $request));
    }

    public function resendEmailVerification(ResendEmailVerificationRequest $request)
    {
        $this->auth->resendEmailVerification($request->validated('email'));

        return response()->json(['message' => 'Verification code sent to email.']);
    }

    public function login(LoginRequest $request)
    {
        return new AuthResource($this->auth->login($request->validated(), $request));
    }

    public function me(Request $request)
    {
        return new UserResource($request->user()->load('profile'));
    }

    public function logout(Request $request)
    {
        $this->auth->logout($request->user());

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function logoutAll(Request $request)
    {
        $this->auth->logoutAll($request->user());

        return response()->json(['message' => 'Logged out from all devices successfully.']);
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $this->passwordReset->sendResetLink($request->validated('email'));

        return response()->json(['message' => 'Password reset link sent.']);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $this->passwordReset->reset($request->validated());

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
