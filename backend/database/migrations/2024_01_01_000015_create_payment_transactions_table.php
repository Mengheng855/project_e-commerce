<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 20); // bakong, aba, credit_card, cash
            $table->string('currency', 10)->default('USD');
            $table->string('status', 20)->default('pending')->index();

            // QR / Bakong fields
            $table->text('qr_code_string')->nullable();
            $table->string('qr_code_md5', 32)->nullable();
            $table->string('qr_code_image')->nullable();  // file path
            $table->string('bakong_bill_number', 100)->nullable();
            $table->string('bakong_reference', 255)->nullable();

            // Gateway
            $table->text('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
