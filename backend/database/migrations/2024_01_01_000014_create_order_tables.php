<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 20)->unique();
            $table->decimal('total_amount', 10, 2);
            $table->string('status', 20)->default('pending')->index();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('product_id')
                  ->nullable()
                  ->constrained('products')
                  ->onDelete('set null');

            // Snapshot fields — preserved even if product is deleted
            $table->string('product_name', 100);
            $table->string('variant_label', 200)->nullable();
            $table->integer('qty');
            $table->decimal('price', 10, 2);

            // Delivery info per item (matches original Django model placement)
            $table->text('delivery_address')->nullable();
            $table->decimal('delivery_lat', 18, 15)->nullable();
            $table->decimal('delivery_lng', 18, 15)->nullable();

            $table->timestamps();

            $table->index(['order_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
