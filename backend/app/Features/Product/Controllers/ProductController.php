<?php

namespace App\Features\Product\Controllers;

use App\Features\Product\Requests\StoreProductRequest;
use App\Features\Product\Requests\UpdateProductRequest;
use App\Features\Product\Resources\ProductListResource;
use App\Features\Product\Resources\ProductResource;
use App\Features\Product\Services\ProductService;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $products)
    {
    }

    public function index(Request $request)
    {
        $products = $this->products->paginate($request->only([
            'search',
            'category_id',
            'brand_id',
            'is_featured',
            'per_page',
        ]));

        return ProductListResource::collection($products);
    }

    public function adminIndex(Request $request)
    {
        $products = $this->products->paginate($request->only([
            'search',
            'category_id',
            'brand_id',
            'is_featured',
            'per_page',
        ]), includeInactive: true);

        return ProductListResource::collection($products);
    }

    public function adminShow(Request $request, Product $product)
    {
        $this->products->ensureCanView($product, $request->user());

        return new ProductResource($this->products->loadForDetail($product));
    }

    public function store(StoreProductRequest $request)
    {
        $product = $this->products->create($request->validated(), $request->user());

        return (new ProductResource($product))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Product $product)
    {
        $this->products->ensureCanView($product, $request->user());

        return new ProductResource($this->products->loadForDetail($product));
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $product = $this->products->update($product, $request->validated(), $request->user());

        return new ProductResource($product);
    }

    public function destroy(Request $request, Product $product)
    {
        $this->products->delete($product, $request->user());

        return response()->noContent();
    }
}
