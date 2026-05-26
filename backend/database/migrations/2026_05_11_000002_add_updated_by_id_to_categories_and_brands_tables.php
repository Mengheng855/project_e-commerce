<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('updated_by_id')->nullable()->after('user_id')->constrained('users')->onDelete('set null');
        });

        Schema::table('brands', function (Blueprint $table) {
            $table->foreignId('updated_by_id')->nullable()->after('user_id')->constrained('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->dropConstrainedForeignId('updated_by_id');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropConstrainedForeignId('updated_by_id');
        });
    }
};
