<?php

namespace App\Features\Product\Controllers;

use App\Models\VariantType;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\Rule;

class VariantTypeController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => VariantType::query()
                ->withCount('variants')
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:variant_types,name'],
        ]);

        $variantType = VariantType::query()->create($validated);

        return response()->json(['data' => $variantType->loadCount('variants')], 201);
    }

    public function update(Request $request, VariantType $variantType)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', Rule::unique('variant_types', 'name')->ignore($variantType->id)],
        ]);

        $variantType->update($validated);

        return response()->json(['data' => $variantType->loadCount('variants')]);
    }

    public function destroy(VariantType $variantType)
    {
        if ($variantType->variants()->exists()) {
            return response()->json([
                'message' => 'This variant type is used by products and cannot be deleted.',
            ], 422);
        }

        $variantType->delete();

        return response()->noContent();
    }
}
