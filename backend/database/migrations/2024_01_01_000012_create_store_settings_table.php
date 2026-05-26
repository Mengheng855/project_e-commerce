<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();

            // General
            $table->string('store_name', 120)->default('TosTinh');
            $table->string('store_email')->nullable();
            $table->string('store_phone', 30)->nullable();
            $table->text('store_address')->nullable();
            $table->string('currency', 10)->default('USD');
            $table->string('timezone', 64)->default('Asia/Phnom_Penh');
            $table->string('store_logo')->nullable();

            // Security
            $table->boolean('login_alerts')->default(true);
            $table->boolean('two_factor_required')->default(false);
            $table->unsignedInteger('password_expiry_days')->default(90);
            $table->unsignedInteger('session_timeout_minutes')->default(30);

            // Notifications
            $table->boolean('order_email_notifications')->default(true);
            $table->boolean('low_stock_notifications')->default(true);
            $table->boolean('marketing_emails')->default(false);
            $table->string('notify_email')->nullable();
            $table->boolean('enable_telegram_receipts')->default(false);
            $table->string('telegram_chat_id', 100)->nullable();

            // Payments
            $table->string('currency_position', 10)->default('before');
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->boolean('enable_cod')->default(true);
            $table->boolean('enable_card_payments')->default(true);
            $table->boolean('enable_bank_transfer')->default(false);

            // Shipping
            $table->string('shipping_origin', 200)->nullable();
            $table->decimal('free_shipping_threshold', 10, 2)->default(0);
            $table->decimal('flat_shipping_rate', 10, 2)->default(0);
            $table->unsignedInteger('processing_time_days')->default(2);

            // Email branding
            $table->string('email_from_name', 120)->default('TosTinh');
            $table->text('email_footer_text')->nullable();
            $table->boolean('enable_branded_emails')->default(true);

            // UI
            $table->string('theme_mode', 10)->default('light');
            $table->string('accent_color', 7)->default('#e85a4f');
            $table->boolean('show_store_logo_in_header')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
