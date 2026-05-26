<?php

namespace App\Features\Product\Controllers;

use App\Features\Product\Requests\UploadProductImagesRequest;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;

class ProductImageUploadController extends Controller
{
    public function __invoke(UploadProductImagesRequest $request)
    {
        $images = collect($request->file('images', []))
            ->map(function ($file) {
                $path = $file->store('products', 'public');
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
}
