<?php

namespace App\Features\Brand\Controllers;

use App\Features\Brand\Requests\StoreBrandRequest;
use App\Features\Brand\Requests\UpdateBrandRequest;
use App\Features\Brand\Resources\BrandResource;
use App\Features\Brand\Services\BrandService;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class BrandController extends Controller
{
    public function __construct(private readonly BrandService $brands)
    {
    }

    public function index(Request $request)
    {
        return BrandResource::collection($this->brands->paginate($request->only(['search', 'per_page'])));
    }

    public function store(StoreBrandRequest $request)
    {
        return (new BrandResource($this->brands->create($request->validated(), $request->user())))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Brand $brand)
    {
        $this->brands->ensureCanView($brand, $request->user());

        return new BrandResource($brand->load(['user:id,username,email', 'updatedBy:id,username,email'])->loadCount('products'));
    }

    public function update(UpdateBrandRequest $request, Brand $brand)
    {
        return new BrandResource($this->brands->update($brand, $request->validated(), $request->user()));
    }

    public function destroy(Request $request, Brand $brand)
    {
        $this->brands->delete($brand, $request->user());

        return response()->noContent();
    }
}
