<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->string('title', 160)->nullable()->after('foreground_image');
        });

        DB::table('banners')
            ->whereNull('title')
            ->update(['title' => 'Computers, phones, and clean tech essentials.']);
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }
};
