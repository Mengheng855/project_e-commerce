<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE email_otps MODIFY otp VARCHAR(255) NOT NULL');
        }

        Schema::table('email_otps', function (Blueprint $table) {
            if (! Schema::hasColumn('email_otps', 'attempts')) {
                $table->unsignedTinyInteger('attempts')->default(0)->after('otp');
            }

            if (! Schema::hasColumn('email_otps', 'locked_until')) {
                $table->timestamp('locked_until')->nullable()->after('attempts');
            }
        });
    }

    public function down(): void
    {
        Schema::table('email_otps', function (Blueprint $table) {
            if (Schema::hasColumn('email_otps', 'locked_until')) {
                $table->dropColumn('locked_until');
            }

            if (Schema::hasColumn('email_otps', 'attempts')) {
                $table->dropColumn('attempts');
            }
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE email_otps MODIFY otp VARCHAR(6) NOT NULL');
        }
    }
};
