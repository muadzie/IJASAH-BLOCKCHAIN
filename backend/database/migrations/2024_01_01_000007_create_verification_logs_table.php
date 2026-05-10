<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verification_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ijazah_id')->nullable();
            $table->string('certificate_hash', 64)->nullable();
            $table->enum('verification_method', ['hash', 'file_upload', 'qr_code']);
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('verification_result')->nullable();
            $table->boolean('is_valid')->nullable();
            $table->timestamps();
            $table->foreign('ijazah_id')->references('id')->on('ijazah')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_logs');
    }
};
