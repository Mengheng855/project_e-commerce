<?php

namespace App\Features\User\Controllers;

use App\Features\User\Requests\StoreUserRequest;
use App\Features\User\Requests\UpdateUserRequest;
use App\Features\User\Resources\UserResource;
use App\Features\User\Services\UserService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function __construct(private readonly UserService $users)
    {
    }

    public function index(Request $request)
    {
        return UserResource::collection($this->users->paginate($request->only(['search', 'per_page']), $request->user()));
    }

    public function store(StoreUserRequest $request)
    {
        return (new UserResource($this->users->create($request->validated())))
            ->response()
            ->setStatusCode(201);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user()->load('profile'));
    }

    public function show(Request $request, User $user)
    {
        $this->users->ensureCanView($user, $request->user());

        return new UserResource($user->load(['profile', 'loginSessions' => fn ($query) => $query->latest('logged_in_at')->limit(20)]));
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        return new UserResource($this->users->update($user, $request->validated(), $request->user()));
    }

    public function updateMe(UpdateUserRequest $request)
    {
        return new UserResource($this->users->update($request->user(), $request->validated(), $request->user())->load('profile'));
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:4096'],
        ]);

        $path = $request->file('avatar')->store('avatars', 'public');
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'data' => [
                'path' => $path,
                'avatar' => $url,
                'url' => $url,
            ],
        ], 201);
    }

    public function destroy(Request $request, User $user)
    {
        $this->users->delete($user, $request->user());

        return response()->noContent();
    }
}
