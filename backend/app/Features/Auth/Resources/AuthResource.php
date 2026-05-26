<?php

namespace App\Features\Auth\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $this->resource['user'];

        return [
            'token' => $this->resource['token'],
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'is_admin' => $user->is_admin,
                'is_active' => $user->is_active,
                'profile' => $user->relationLoaded('profile') && $user->profile ? [
                    'phone_number' => $user->profile->phone_number,
                    'address' => $user->profile->address,
                    'avatar' => $user->profile->avatar,
                    'gender' => $user->profile->gender,
                    'dob' => $user->profile->dob?->toDateString(),
                ] : null,
                'email_verified_at' => $user->email_verified_at?->toISOString(),
                'created_at' => $user->created_at?->toISOString(),
                'updated_at' => $user->updated_at?->toISOString(),
            ],
        ];
    }
}
