<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ijazah', function (Blueprint $table) {
            $table->string('pdf_hash', 64)->nullable()->after('hash_sha256');
        });
    }

    public function down(): void
    {
        Schema::table('ijazah', function (Blueprint $table) {
            $table->dropColumn('pdf_hash');
        });
    }
};
