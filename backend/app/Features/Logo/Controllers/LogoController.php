<?php

namespace App\Features\Logo\Controllers;

use App\Features\Logo\Resources\LogoResource;
use App\Models\Logo;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;

class LogoController extends Controller
{
    public function active()
    {
        $logo = Logo::query()
            ->where('is_active', true)
            ->latest()
            ->first();

        return $logo ? new LogoResource($logo->load('user')) : response()->json(['data' => null]);
    }

    public function index()
    {
        return LogoResource::collection(Logo::query()->with('user')->latest()->get());
    }

    public function show(Logo $logo)
    {
        return new LogoResource($logo->load('user'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'image' => ['required', 'string', 'max:500'],
            'title' => ['nullable', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $logo = Logo::create($validated + ['user_id' => $request->user()?->id]);

        return (new LogoResource($logo->load('user')))->response()->setStatusCode(201);
    }

    public function update(Request $request, Logo $logo)
    {
        $validated = $request->validate([
            'image' => ['sometimes', 'required', 'string', 'max:500'],
            'title' => ['nullable', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $logo->update($validated);

        return new LogoResource($logo->refresh()->load('user'));
    }

    public function destroy(Logo $logo)
    {
        $logo->delete();

        return response()->noContent();
    }

    public function upload(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif,svg', 'max:4096'],
        ]);

        $path = $request->file('image')->store('logos', 'public');
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'data' => [
                'path' => $path,
                'image' => $url,
                'url' => $url,
            ],
        ], 201);
    }
}
