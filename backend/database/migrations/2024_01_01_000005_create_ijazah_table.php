<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ijazah', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mahasiswa_id');
            $table->string('nomor_ijazah', 50)->unique();
            $table->string('hash_sha256', 64)->unique();
            $table->string('qr_code_path', 255)->nullable();
            $table->string('file_path', 255)->nullable();
            $table->string('blockchain_tx_hash', 66)->nullable();
            $table->string('blockchain_block', 20)->nullable();
            $table->timestamp('blockchain_timestamp')->nullable();
            $table->enum('status', ['draft', 'pending', 'issued', 'revoked'])->default('draft');
            $table->uuid('issued_by')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa');
            $table->foreign('issued_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ijazah');
    }
};
