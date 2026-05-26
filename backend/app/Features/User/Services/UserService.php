<?php

namespace App\Features\User\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class UserService
{
    public function paginate(array $filters, User $actor): LengthAwarePaginator
    {
        $this->ensureAdmin($actor);

        $perPage = max(1, min((int) ($filters['per_page'] ?? 10), 50));

        return User::query()
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $query->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): User
    {
        return User::create($this->publicUserData($data));
    }

    public function update(User $user, array $data, User $actor): User
    {
        $this->ensureCanManage($user, $actor);

        if (! $actor->is_admin) {
            unset($data['is_admin'], $data['is_active']);
        }

        $user->update($this->publicUserData($data) + array_intersect_key($data, array_flip(['is_admin', 'is_active'])));

        $profileData = $this->profileData($data);
        if ($profileData !== []) {
            $user->profile()->updateOrCreate(['user_id' => $user->id], $profileData);
        }

        return $user->refresh()->load('profile');
    }

    public function delete(User $user, User $actor): void
    {
        $this->ensureAdmin($actor);

        if ($user->id === $actor->id) {
            abort(422, 'You cannot delete your own account.');
        }

        $user->delete();
    }

    public function ensureCanView(User $user, User $actor): void
    {
        if ($actor->is_admin || $user->id === $actor->id) {
            return;
        }

        abort(403, 'You are not allowed to view this user.');
    }

    private function ensureCanManage(User $user, User $actor): void
    {
        if ($actor->is_admin || $user->id === $actor->id) {
            return;
        }

        abort(403, 'You are not allowed to manage this user.');
    }

    private function ensureAdmin(User $actor): void
    {
        if (! $actor->is_admin) {
            abort(403, 'Admin access is required.');
        }
    }

    private function profileData(array $data): array
    {
        return array_intersect_key($data, array_flip([
            'phone_number',
            'address',
            'avatar',
            'gender',
            'dob',
        ]));
    }

    private function publicUserData(array $data): array
    {
        return array_intersect_key($data, array_flip([
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
        ]));
    }
}
