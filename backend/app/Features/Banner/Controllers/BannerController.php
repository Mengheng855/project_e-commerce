<?php

namespace App\Features\Banner\Controllers;

use App\Features\Banner\Resources\BannerResource;
use App\Features\Banner\Services\BannerService;
use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Banner;

class BannerController extends Controller
{
    public function __construct(private readonly BannerService $banners)
    {
    }

    public function index()
    {
        return BannerResource::collection($this->banners->active());
    }

    public function all(Request $request)
    {
        return BannerResource::collection($this->banners->all());
    }

    public function show(Banner $banner)
    {
        return new BannerResource($banner);
    }

    public function destroy(Banner $banner)
    {
        $this->banners->delete($banner);
        return response()->json(null, 204);
    }

    public function upload(Request $request)
    {
        $validated = $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:2'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:8192'],
        ]);

        $images = collect($request->file('images', []))
            ->map(function ($file) {
                $path = $file->store('banners', 'public');
                $url = Storage::disk('public')->url($path);

                return [
                    'path' => $path,
                    'image' => $url,
                    'url' => $url,
                ];
            })
            ->values();

        return response()->json(['data' => $images], 201);
    }

    public function update(Request $request, Banner $banner)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:160',
            'text' => 'nullable|string|max:500',
            'image' => 'nullable|string|max:500',
            'foreground_image' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $updated = $this->banners->update($banner, $validated);
        return new BannerResource($updated);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:160',
            'text' => 'nullable|string|max:500',
            'image' => 'required|string|max:500',
            'foreground_image' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $banner = Banner::create($validated);
        return (new BannerResource($banner))->response()->setStatusCode(201);
    }
}
