<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicates = DB::table('products')
            ->select('name')
            ->whereNotNull('name')
            ->groupBy('name')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('name');

        foreach ($duplicates as $name) {
            $products = DB::table('products')
                ->where('name', $name)
                ->orderBy('id')
                ->get(['id', 'name', 'slug']);

            foreach ($products->skip(1) as $product) {
                DB::table('products')
                    ->where('id', $product->id)
                    ->update(['name' => $product->name.' #'.$product->id]);
            }
        }

        Schema::table('products', function (Blueprint $table) {
            $table->unique('name');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });
    }
};
