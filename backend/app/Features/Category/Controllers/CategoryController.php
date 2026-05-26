<?php

namespace App\Features\Category\Controllers;

use App\Features\Category\Requests\StoreCategoryRequest;
use App\Features\Category\Requests\UpdateCategoryRequest;
use App\Features\Category\Resources\CategoryResource;
use App\Features\Category\Services\CategoryService;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryService $categories)
    {
    }

    public function index(Request $request)
    {
        return CategoryResource::collection($this->categories->paginate($request->only(['search', 'has_products', 'per_page'])));
    }

    public function store(StoreCategoryRequest $request)
    {
        return (new CategoryResource($this->categories->create($request->validated(), $request->user())))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Category $category)
    {
        $this->categories->ensureCanView($category, $request->user());

        return new CategoryResource($category->load(['user:id,username', 'updatedBy:id,username'])->loadCount('products'));
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        return new CategoryResource($this->categories->update($category, $request->validated(), $request->user()));
    }

    public function destroy(Request $request, Category $category)
    {
        $this->categories->delete($category, $request->user());

        return response()->noContent();
    }
}
