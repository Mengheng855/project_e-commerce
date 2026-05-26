<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->json('selected_options')->nullable()->after('variant_id');
            $table->string('variant_label', 200)->nullable()->after('selected_options');
            $table->string('selection_hash', 64)->default('base')->after('variant_label');
            $table->decimal('unit_price', 10, 2)->default(0)->after('qty');

            $table->unique(['cart_id', 'product_id', 'selection_hash']);
        });
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropUnique(['cart_id', 'product_id', 'selection_hash']);
            $table->dropColumn(['selected_options', 'variant_label', 'selection_hash', 'unit_price']);
        });
    }
};
