<?php

namespace App\Features\User\Resources;

use App\Support\PublicUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'is_admin' => $this->when($request->user()?->is_admin, $this->is_admin),
            'is_active' => $this->when($request->user()?->is_admin, $this->is_active),
            'profile' => $this->whenLoaded('profile', fn () => $this->profile ? [
                'phone_number' => $this->profile->phone_number,
                'address' => $this->profile->address,
                'avatar' => PublicUrl::normalize($this->profile->avatar),
                'gender' => $this->profile->gender,
                'dob' => $this->profile->dob?->toDateString(),
            ] : null),
            'login_sessions' => $this->when($request->user()?->is_admin && $this->relationLoaded('loginSessions'), fn () => $this->loginSessions->map(fn ($session) => [
                'id' => $session->id,
                'device_name' => $session->device_name,
                'browser' => $session->browser,
                'platform' => $session->platform,
                'ip_address' => $session->ip_address,
                'country' => $session->country,
                'city' => $session->city,
                'latitude' => $session->latitude,
                'longitude' => $session->longitude,
                'user_agent' => $session->user_agent,
                'logged_in_at' => $session->logged_in_at?->toISOString(),
                'last_active_at' => $session->last_active_at?->toISOString(),
                'logged_out_at' => $session->logged_out_at?->toISOString(),
                'is_active' => $session->logged_out_at === null,
            ])->values()),
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
