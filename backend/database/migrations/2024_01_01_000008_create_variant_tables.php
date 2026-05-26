<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Variant Types (e.g. "Color", "Size")
        Schema::create('variant_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
        });

        // Product Variants (e.g. product X in "Red", "Large")
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('variant_type_id')->constrained('variant_types')->onDelete('cascade');
            $table->string('value', 100);
            $table->string('color_hex', 7)->nullable();
            $table->decimal('price_modifier', 10, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->boolean('is_active')->default(true);

            $table->unique(['product_id', 'variant_type_id', 'value']);
            $table->index(['product_id', 'variant_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('variant_types');
    }
};
